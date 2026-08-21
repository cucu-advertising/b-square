import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/api_config.dart';
import '../../models/chat_models.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/chat_service.dart';
import '../../services/chat_socket.dart';
import '../../theme/app_theme.dart';

class ChatThreadScreen extends StatefulWidget {
  const ChatThreadScreen({
    super.key,
    required this.peerUserId,
    required this.peerName,
    this.peerPhotoUrl,
    this.onMessageSent,
  });

  final String peerUserId;
  final String peerName;
  final String? peerPhotoUrl;

  /// Called after a message is successfully saved so the inbox can update immediately.
  final ValueChanged<ChatMessage>? onMessageSent;

  @override
  State<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends State<ChatThreadScreen> {
  static const _bg = Color(0xFF0B1020);
  static const _sentBubble = Color(0xFF3B3D8F);
  static const _receivedBubble = Color(0xFF262930);
  static const _composerSurface = Color(0xFF141B33);

  final _chatService = ChatService();
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();

  List<ChatMessage> _messages = [];
  bool _loading = true;
  bool _sending = false;
  bool _didMutate = false;
  String? _error;
  StreamSubscription<Map<String, dynamic>>? _socketSub;

  String get _currentUserId => context.read<SignupFlowProvider>().data.id;

  @override
  void initState() {
    super.initState();
    _load();
    _socketSub = ChatSocket.instance.events.listen(_onSocketEvent);
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSocketEvent(Map<String, dynamic> event) {
    final type = event['type']?.toString();
    if (type == 'message.new') {
      final raw = event['message'];
      if (raw is! Map) return;
      final message = ChatMessage.fromJson(Map<String, dynamic>.from(raw));
      final fromPeer = message.senderId == widget.peerUserId;
      final toMe = message.receiverId == _currentUserId;
      if (!fromPeer || !toMe) return;
      if (_messages.any((m) => m.id == message.id)) return;

      setState(() {
        _messages = [..._messages, message];
        _didMutate = true;
      });
      _scrollToBottom();
      unawaited(() async {
        try {
          await _chatService.markRead(widget.peerUserId);
        } catch (_) {}
      }());
      return;
    }

    if (type == 'message.read') {
      final readerId = event['readerId']?.toString();
      if (readerId != widget.peerUserId) return;
      final now = DateTime.now();
      setState(() {
        _messages = [
          for (final m in _messages)
            if (m.senderId == _currentUserId && m.readAt == null)
              ChatMessage(
                id: m.id,
                conversationId: m.conversationId,
                senderId: m.senderId,
                receiverId: m.receiverId,
                content: m.content,
                createdAt: m.createdAt,
                readAt: now,
              )
            else
              m,
        ];
      });
    }
  }

  void _pop() => Navigator.of(context).pop(_didMutate);

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final messages = await _chatService.fetchMessages(widget.peerUserId);
      try {
        await _chatService.markRead(widget.peerUserId);
      } on ChatException {
        // Non-blocking.
      }
      if (!mounted) return;
      setState(() {
        _messages = messages;
        _loading = false;
      });
      _scrollToBottom();
    } on ChatException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this chat.';
        _loading = false;
      });
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;

    final me = _currentUserId;
    final tempId = 'local-${DateTime.now().microsecondsSinceEpoch}';
    final optimistic = ChatMessage(
      id: tempId,
      conversationId: '',
      senderId: me,
      receiverId: widget.peerUserId,
      content: text,
      createdAt: DateTime.now(),
    );

    setState(() {
      _messages = [..._messages, optimistic];
      _controller.clear();
      _sending = true;
      _didMutate = true;
    });
    _scrollToBottom();

    try {
      final message = await _chatService.sendMessage(widget.peerUserId, text);
      if (!mounted) return;
      setState(() {
        _messages = [
          for (final m in _messages)
            if (m.id == tempId) message else m,
        ];
        _sending = false;
      });
      widget.onMessageSent?.call(message);
    } on ChatException catch (e) {
      if (!mounted) return;
      setState(() {
        _messages = _messages.where((m) => m.id != tempId).toList();
        _controller.text = text;
        _controller.selection = TextSelection.collapsed(offset: text.length);
        _sending = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages = _messages.where((m) => m.id != tempId).toList();
        _controller.text = text;
        _controller.selection = TextSelection.collapsed(offset: text.length);
        _sending = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send message')),
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 120,
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
      );
    });
  }

  String _formatTime(DateTime time) {
    final local = time.toLocal();
    final h = local.hour % 12 == 0 ? 12 : local.hour % 12;
    final m = local.minute.toString().padLeft(2, '0');
    final suffix = local.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $suffix';
  }

  String _dayLabel(DateTime time) {
    final now = DateTime.now();
    final local = time.toLocal();
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(local.year, local.month, local.day);
    final diff = today.difference(day).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (diff < 7) return weekdays[local.weekday - 1];
    return '${local.month}/${local.day}/${local.year}';
  }

  ImageProvider? _peerImage() {
    final photo = widget.peerPhotoUrl;
    if (photo == null || photo.isEmpty) return null;
    return NetworkImage(
      photo.startsWith('http') ? photo : '${ApiConfig.baseUrl}$photo',
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _pop();
      },
      child: Scaffold(
        backgroundColor: _bg,
        body: SafeArea(
          child: Column(
            children: [
              _ThreadHeader(
                name: widget.peerName,
                image: _peerImage(),
                onBack: _pop,
                onMore: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Chat options coming soon')),
                  );
                },
              ),
              Expanded(child: _buildBody()),
              _Composer(
                controller: _controller,
                focusNode: _focusNode,
                sending: _sending,
                surface: _composerSurface,
                onSend: _send,
                onAttach: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Attachments coming soon')),
                  );
                },
                onEmoji: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Emoji picker coming soon')),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.purple),
      );
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppTheme.manrope(color: AppColors.mutedText),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _load,
                child: Text(
                  'Retry',
                  style: AppTheme.manrope(
                    color: AppColors.purple,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final me = _currentUserId;
    final items = <_ThreadItem>[];
    String? lastDay;
    for (final message in _messages) {
      final day = _dayLabel(message.createdAt);
      if (day != lastDay) {
        items.add(_ThreadItem.day(day));
        lastDay = day;
      }
      items.add(_ThreadItem.message(message));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 16),
      itemCount: items.isEmpty ? 1 : items.length,
      itemBuilder: (context, index) {
        if (items.isEmpty) {
          return Padding(
            padding: const EdgeInsets.only(top: 28),
            child: Center(
              child: Text(
                'Say hello to ${widget.peerName}',
                style: AppTheme.manrope(
                  color: AppColors.mutedText,
                  fontSize: 14,
                ),
              ),
            ),
          );
        }

        final item = items[index];
        return switch (item.kind) {
          _ThreadItemKind.day => Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C2233),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Text(
                    item.dayLabel!,
                    style: AppTheme.manrope(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.lightMuted,
                    ),
                  ),
                ),
              ),
            ),
          _ThreadItemKind.message => _MessageBubble(
              message: item.message!,
              mine: me.isNotEmpty && item.message!.isMine(me),
              timeLabel: _formatTime(item.message!.createdAt),
              sentColor: _sentBubble,
              receivedColor: _receivedBubble,
            ),
        };
      },
    );
  }
}

enum _ThreadItemKind { day, message }

class _ThreadItem {
  _ThreadItem._({required this.kind, this.dayLabel, this.message});

  factory _ThreadItem.day(String label) =>
      _ThreadItem._(kind: _ThreadItemKind.day, dayLabel: label);
  factory _ThreadItem.message(ChatMessage message) =>
      _ThreadItem._(kind: _ThreadItemKind.message, message: message);

  final _ThreadItemKind kind;
  final String? dayLabel;
  final ChatMessage? message;
}

class _ThreadHeader extends StatelessWidget {
  const _ThreadHeader({
    required this.name,
    required this.image,
    required this.onBack,
    required this.onMore,
  });

  final String name;
  final ImageProvider? image;
  final VoidCallback onBack;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 10),
      child: Row(
        children: [
          IconButton(
            onPressed: onBack,
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: AppColors.white,
              size: 20,
            ),
          ),
          CircleAvatar(
            radius: 20,
            backgroundColor: AppColors.secondary,
            backgroundImage: image,
            child: image == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: AppTheme.manrope(
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              name,
              style: AppTheme.manrope(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: onMore,
            icon: const Icon(
              Icons.more_vert_rounded,
              color: AppColors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.mine,
    required this.timeLabel,
    required this.sentColor,
    required this.receivedColor,
  });

  final ChatMessage message;
  final bool mine;
  final String timeLabel;
  final Color sentColor;
  final Color receivedColor;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.only(
      topLeft: const Radius.circular(18),
      topRight: const Radius.circular(18),
      bottomLeft: Radius.circular(mine ? 18 : 6),
      bottomRight: Radius.circular(mine ? 6 : 18),
    );

    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.fromLTRB(14, 10, 12, 8),
        decoration: BoxDecoration(
          color: mine ? sentColor : receivedColor,
          borderRadius: radius,
        ),
        child: Column(
          crossAxisAlignment:
              mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              message.content,
              style: AppTheme.manrope(
                fontSize: 15,
                height: 1.35,
                color: AppColors.white,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  timeLabel,
                  style: AppTheme.manrope(
                    fontSize: 11,
                    color: AppColors.lightMuted,
                  ),
                ),
                if (mine) ...[
                  const SizedBox(width: 4),
                  Icon(
                    message.readAt != null
                        ? Icons.done_all_rounded
                        : Icons.done_rounded,
                    size: 15,
                    color: message.readAt != null
                        ? const Color(0xFFB8F34A)
                        : AppColors.lightMuted,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.focusNode,
    required this.sending,
    required this.surface,
    required this.onSend,
    required this.onAttach,
    required this.onEmoji,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool sending;
  final Color surface;
  final VoidCallback onSend;
  final VoidCallback onAttach;
  final VoidCallback onEmoji;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Color(0xFF222A44)),
        ),
      ),
      child: Row(
        children: [
          Material(
            color: surface,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: onAttach,
              child: const SizedBox(
                width: 44,
                height: 44,
                child: Icon(Icons.add_rounded, color: AppColors.white),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              constraints: const BoxConstraints(minHeight: 44),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(color: const Color(0xFF2E3858)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller,
                      focusNode: focusNode,
                      minLines: 1,
                      maxLines: 4,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => onSend(),
                      style: AppTheme.manrope(
                        color: AppColors.white,
                        fontSize: 15,
                      ),
                      cursorColor: AppColors.purple,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        hintStyle: AppTheme.manrope(
                          color: AppColors.lightMuted,
                          fontSize: 14,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding:
                            const EdgeInsets.fromLTRB(16, 12, 4, 12),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: onEmoji,
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(
                      Icons.emoji_emotions_outlined,
                      color: AppColors.lightMuted,
                      size: 22,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: AppColors.purple,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: sending ? null : onSend,
              child: SizedBox(
                width: 46,
                height: 46,
                child: sending
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.white,
                        ),
                      )
                    : const Icon(
                        Icons.send_rounded,
                        color: AppColors.white,
                        size: 20,
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
