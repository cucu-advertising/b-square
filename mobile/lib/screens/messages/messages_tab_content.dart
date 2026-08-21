import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/api_config.dart';
import '../../models/chat_models.dart';
import '../../models/connection_request.dart';
import '../../services/chat_service.dart';
import '../../services/chat_socket.dart';
import '../../services/connection_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../profile/member_profile_screen.dart';
import 'chat_thread_screen.dart';

const _chatSafetyBannerDismissedKey = 'chat_safety_banner_dismissed';

/// Messages tab — Chats / Requests / Connections backed by backend-mobile.
class MessagesTabContent extends StatefulWidget {
  const MessagesTabContent({super.key, this.onBadgeCountChanged});

  /// Unread chat messages + pending requests / request updates.
  final ValueChanged<int>? onBadgeCountChanged;

  @override
  State<MessagesTabContent> createState() => _MessagesTabContentState();
}

class _MessagesTabContentState extends State<MessagesTabContent> {
  final _connectionService = ConnectionService();
  final _chatService = ChatService();
  int _tabIndex = 0;
  bool _showInfoBanner = true;
  bool _loading = true;
  String? _error;
  List<ChatConversation> _conversations = [];
  List<ConnectionRequestItem> _requests = [];
  List<ConnectionNotificationItem> _updates = [];
  List<ConnectionUserPreview> _connections = [];
  StreamSubscription<Map<String, dynamic>>? _socketSub;

  int get _requestsBadgeCount =>
      _requests.length + _updates.where((n) => !n.isRead).length;

  int get _navBadgeCount {
    final unreadChats =
        _conversations.fold<int>(0, (sum, c) => sum + c.unreadCount);
    return unreadChats + _requestsBadgeCount;
  }

  void _emitBadge() {
    widget.onBadgeCountChanged?.call(_navBadgeCount);
  }

  @override
  void initState() {
    super.initState();
    _load();
    _socketSub = ChatSocket.instance.events.listen(_onSocketEvent);
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    super.dispose();
  }

  void _onSocketEvent(Map<String, dynamic> event) {
    final type = event['type']?.toString();
    if (type == 'message.new') {
      unawaited(_refreshInbox());
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _connectionService.fetchReceivedRequests(),
        _connectionService.fetchConnections(),
        _connectionService.fetchNotifications(),
        _chatService.fetchConversations(),
      ]);
      if (!mounted) return;
      final notifications = results[2] as List<ConnectionNotificationItem>;
      setState(() {
        _requests = results[0] as List<ConnectionRequestItem>;
        _connections = results[1] as List<ConnectionUserPreview>;
        // Sender-side updates: approved / declined responses to requests I sent.
        _updates = notifications
            .where((n) => (n.isAccepted || n.isDeclined) && !n.isRead)
            .toList();
        _conversations = results[3] as List<ChatConversation>;
        _loading = false;
      });
      _emitBadge();
    } on ConnectionException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } on ChatException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load messages right now.';
        _loading = false;
      });
    }
  }

  void _upsertConversation({
    required String peerUserId,
    required String peerName,
    String? peerPhotoUrl,
    required ChatMessage message,
  }) {
    final updated = ChatConversation(
      id: message.conversationId,
      peerUserId: peerUserId,
      peerName: peerName,
      peerProfilePhotoUrl: peerPhotoUrl,
      lastMessage: message.content,
      lastMessageAt: message.createdAt,
      lastSenderId: message.senderId,
      unreadCount: 0,
    );

    setState(() {
      final existing = _conversations.indexWhere(
        (c) => c.peerUserId == peerUserId,
      );
      final next = [..._conversations];
      if (existing >= 0) next.removeAt(existing);
      _conversations = [updated, ...next];
      _tabIndex = 0;
    });
    _emitBadge();
  }

  Future<void> _openChat({
    required String peerUserId,
    required String peerName,
    String? peerPhotoUrl,
  }) async {
    // Opening a thread marks it read — clear local unread for snappy nav badge.
    setState(() {
      _conversations = [
        for (final c in _conversations)
          if (c.peerUserId == peerUserId)
            ChatConversation(
              id: c.id,
              peerUserId: c.peerUserId,
              peerName: c.peerName,
              peerProfilePhotoUrl: c.peerProfilePhotoUrl,
              peerCompanyName: c.peerCompanyName,
              lastMessage: c.lastMessage,
              lastMessageAt: c.lastMessageAt,
              lastSenderId: c.lastSenderId,
              unreadCount: 0,
            )
          else
            c,
      ];
    });
    _emitBadge();

    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => ChatThreadScreen(
          peerUserId: peerUserId,
          peerName: peerName,
          peerPhotoUrl: peerPhotoUrl,
          onMessageSent: (message) {
            _upsertConversation(
              peerUserId: peerUserId,
              peerName: peerName,
              peerPhotoUrl: peerPhotoUrl,
              message: message,
            );
          },
        ),
      ),
    );
    if (!mounted) return;
    if (changed == true) {
      setState(() => _tabIndex = 0);
    }
    await _refreshInbox();
  }

  /// Refresh chats without blocking the whole Messages tab on a spinner.
  Future<void> _refreshInbox() async {
    try {
      final results = await Future.wait([
        _chatService.fetchConversations(),
        _connectionService.fetchReceivedRequests(),
        _connectionService.fetchConnections(),
        _connectionService.fetchNotifications(),
      ]);
      if (!mounted) return;
      final notifications = results[3] as List<ConnectionNotificationItem>;
      setState(() {
        _conversations = results[0] as List<ChatConversation>;
        _requests = results[1] as List<ConnectionRequestItem>;
        _connections = results[2] as List<ConnectionUserPreview>;
        _updates = notifications
            .where((n) => (n.isAccepted || n.isDeclined) && !n.isRead)
            .toList();
        _error = null;
      });
      _emitBadge();
    } catch (_) {
      // Keep the optimistic inbox row if refresh fails.
    }
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _accept(ConnectionRequestItem request) async {
    try {
      await _connectionService.acceptRequest(request.id);
      if (!mounted) return;
      setState(() => _requests.removeWhere((r) => r.id == request.id));
      _emitBadge();
      _showSnack('Accepted ${request.user.name}');
      await _load();
    } on ConnectionException catch (e) {
      if (!mounted) return;
      _showSnack(e.message);
      await _load();
    }
  }

  Future<void> _decline(ConnectionRequestItem request) async {
    try {
      await _connectionService.declineRequest(request.id);
      if (!mounted) return;
      setState(() => _requests.removeWhere((r) => r.id == request.id));
      _emitBadge();
      _showSnack('Declined ${request.user.name}');
    } on ConnectionException catch (e) {
      if (!mounted) return;
      _showSnack(e.message);
      await _load();
    }
  }

  Future<void> _dismissUpdate(ConnectionNotificationItem update) async {
    setState(() => _updates.removeWhere((n) => n.id == update.id));
    _emitBadge();
    try {
      await _connectionService.markNotificationRead(update.id);
    } on ConnectionException {
      // Already removed from UI.
    }
  }

  Future<void> _openRequestProfile(ConnectionRequestItem request) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => MemberProfileScreen(
          userId: request.user.id,
          mode: MemberProfileMode.request,
          requestId: request.id,
        ),
      ),
    );
    if (changed == true && mounted) await _load();
  }

  Future<void> _openConnectionProfile(ConnectionUserPreview user) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => MemberProfileScreen(
          userId: user.id,
          mode: MemberProfileMode.connection,
          onMessageSent: (message) {
            _upsertConversation(
              peerUserId: user.id,
              peerName: user.name,
              peerPhotoUrl: user.profilePhotoUrl,
              message: message,
            );
          },
        ),
      ),
    );
    if (!mounted) return;
    if (changed == true) {
      setState(() => _tabIndex = 0);
    }
    await _refreshInbox();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 12, 0),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Messages',
                  style: AppTheme.manrope(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.6,
                    color: AppColors.white,
                  ),
                ),
              ),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    onPressed: _load,
                    icon: const Icon(
                      Icons.notifications_none_rounded,
                      color: AppColors.white,
                      size: 26,
                    ),
                  ),
                  if (_requestsBadgeCount > 0)
                    Positioned(
                      right: 12,
                      top: 12,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.purple,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: _MessagesTabs(
            selectedIndex: _tabIndex,
            requestsCount: _requestsBadgeCount,
            onChanged: (index) => setState(() => _tabIndex = index),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(child: _buildTabBody()),
      ],
    );
  }

  Widget _buildTabBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.purple),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppTheme.manrope(color: AppColors.mutedText, fontSize: 15),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _load,
                child: Text(
                  'Try again',
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

    return switch (_tabIndex) {
      0 => _ChatsPane(
          conversations: _conversations,
          onRefresh: _load,
          onOpenChat: (c) => _openChat(
            peerUserId: c.peerUserId,
            peerName: c.peerName,
            peerPhotoUrl: c.peerProfilePhotoUrl,
          ),
        ),
      2 => _ConnectionsPane(
          connections: _connections,
          onRefresh: _load,
          onOpenProfile: _openConnectionProfile,
          onMessage: (user) => _openChat(
            peerUserId: user.id,
            peerName: user.name,
            peerPhotoUrl: user.profilePhotoUrl,
          ),
        ),
      _ => _RequestsPane(
          showInfoBanner: _showInfoBanner,
          requests: _requests,
          updates: _updates,
          onDismissBanner: () => setState(() => _showInfoBanner = false),
          onAccept: _accept,
          onDecline: _decline,
          onDismissUpdate: _dismissUpdate,
          onRefresh: _load,
          onViewSent: () => _showSnack('Sent requests coming soon'),
          onOpenProfile: _openRequestProfile,
        ),
    };
  }
}

class _MessagesTabs extends StatelessWidget {
  const _MessagesTabs({
    required this.selectedIndex,
    required this.requestsCount,
    required this.onChanged,
  });

  final int selectedIndex;
  final int requestsCount;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      (label: 'Chats', badge: null as int?),
      (label: 'Requests', badge: requestsCount > 0 ? requestsCount : null),
      (label: 'Connections', badge: null as int?),
    ];

    return Row(
      children: List.generate(tabs.length, (index) {
        final tab = tabs[index];
        final selected = selectedIndex == index;
        return Expanded(
          child: GestureDetector(
            onTap: () => onChanged(index),
            behavior: HitTestBehavior.opaque,
            child: Column(
              children: [
                SizedBox(
                  height: 28,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        tab.label,
                        style: AppTheme.manrope(
                          fontSize: 15,
                          fontWeight:
                              selected ? FontWeight.w700 : FontWeight.w500,
                          color:
                              selected ? AppColors.white : AppColors.mutedText,
                        ),
                      ),
                      if (tab.badge != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          height: 20,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AppColors.purple,
                            borderRadius: BorderRadius.circular(AppRadius.pill),
                          ),
                          child: Text(
                            '${tab.badge}',
                            style: AppTheme.manrope(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onCta,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  height: 2,
                  width: selected ? 36 : 0,
                  decoration: BoxDecoration(
                    color: AppColors.purple,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}

class _RequestsPane extends StatelessWidget {
  const _RequestsPane({
    required this.showInfoBanner,
    required this.requests,
    required this.updates,
    required this.onDismissBanner,
    required this.onAccept,
    required this.onDecline,
    required this.onDismissUpdate,
    required this.onRefresh,
    required this.onViewSent,
    required this.onOpenProfile,
  });

  final bool showInfoBanner;
  final List<ConnectionRequestItem> requests;
  final List<ConnectionNotificationItem> updates;
  final VoidCallback onDismissBanner;
  final ValueChanged<ConnectionRequestItem> onAccept;
  final ValueChanged<ConnectionRequestItem> onDecline;
  final ValueChanged<ConnectionNotificationItem> onDismissUpdate;
  final Future<void> Function() onRefresh;
  final VoidCallback onViewSent;
  final ValueChanged<ConnectionRequestItem> onOpenProfile;

  @override
  Widget build(BuildContext context) {
    final isEmpty = requests.isEmpty && updates.isEmpty;

    return RefreshIndicator(
      color: AppColors.purple,
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        children: [
          if (showInfoBanner) ...[
            _InfoBanner(onDismiss: onDismissBanner),
            const SizedBox(height: 20),
          ],
          if (updates.isNotEmpty) ...[
            Text(
              'Request updates',
              style: AppTheme.manrope(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${updates.length} new update${updates.length == 1 ? '' : 's'}',
              style: AppTheme.manrope(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.purple,
              ),
            ),
            const SizedBox(height: 12),
            ...updates.map(
              (update) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _ApprovalUpdateCard(
                  update: update,
                  onDismiss: () => onDismissUpdate(update),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Text(
            'Connection Requests',
            style: AppTheme.manrope(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            requests.isEmpty
                ? 'No new requests'
                : '${requests.length} new request${requests.length == 1 ? '' : 's'}',
            style: AppTheme.manrope(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.purple,
            ),
          ),
          const SizedBox(height: 16),
          if (isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: _EmptyPane(
                icon: Icons.mark_email_unread_outlined,
                title: 'You\'re all caught up',
                subtitle: 'New connection requests will show up here.',
              ),
            )
          else if (requests.isNotEmpty) ...[
            Text(
              'Tap profile to view · ✓ to accept · swipe left to decline',
              style: AppTheme.manrope(
                fontSize: 12,
                color: AppColors.lightMuted,
              ),
            ),
            const SizedBox(height: 12),
            ...requests.map(
              (request) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Dismissible(
                  key: ValueKey('request-${request.id}'),
                  direction: DismissDirection.endToStart,
                  onDismissed: (_) => onDecline(request),
                  background: const SizedBox.shrink(),
                  secondaryBackground: const _SwipeRejectBackground(),
                  child: _RequestCard(
                    request: request,
                    onAccept: () => onAccept(request),
                    onOpen: () => onOpenProfile(request),
                  ),
                ),
              ),
            ),
          ],
          if (requests.isNotEmpty) ...[
            const SizedBox(height: 8),
            Center(
              child: TextButton(
                onPressed: onViewSent,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'View Sent Requests',
                      style: AppTheme.manrope(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.purple,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 20,
                      color: AppColors.purple,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ChatsPane extends StatefulWidget {
  const _ChatsPane({
    required this.conversations,
    required this.onRefresh,
    required this.onOpenChat,
  });

  final List<ChatConversation> conversations;
  final Future<void> Function() onRefresh;
  final ValueChanged<ChatConversation> onOpenChat;

  @override
  State<_ChatsPane> createState() => _ChatsPaneState();
}

class _ChatsPaneState extends State<_ChatsPane> {
  final _searchController = TextEditingController();
  String _query = '';
  bool _showSafetyBanner = false;
  bool _bannerReady = false;

  @override
  void initState() {
    super.initState();
    _loadBannerVisibility();
  }

  Future<void> _loadBannerVisibility() async {
    final prefs = await SharedPreferences.getInstance();
    final dismissed = prefs.getBool(_chatSafetyBannerDismissedKey) ?? false;
    if (!mounted) return;
    setState(() {
      // First-time only: show until the user dismisses it once.
      _showSafetyBanner = !dismissed;
      _bannerReady = true;
    });
  }

  Future<void> _dismissSafetyBanner() async {
    setState(() => _showSafetyBanner = false);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_chatSafetyBannerDismissedKey, true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ChatConversation> get _filtered {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return widget.conversations;
    return widget.conversations.where((c) {
      return c.peerName.toLowerCase().contains(q) ||
          c.lastMessage.toLowerCase().contains(q) ||
          c.peerCompanyName.toLowerCase().contains(q);
    }).toList();
  }

  String _formatTime(DateTime? time) {
    if (time == null) return '';
    final now = DateTime.now();
    final local = time.toLocal();
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(local.year, local.month, local.day);
    final diffDays = today.difference(day).inDays;

    if (diffDays == 0) {
      final h = local.hour % 12 == 0 ? 12 : local.hour % 12;
      final m = local.minute.toString().padLeft(2, '0');
      final suffix = local.hour >= 12 ? 'PM' : 'AM';
      return '$h:$m $suffix';
    }
    if (diffDays == 1) return 'Yesterday';
    if (diffDays < 7) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[local.weekday - 1];
    }
    return '${local.month}/${local.day}';
  }

  Color _avatarColor(String seed) {
    const palette = [
      AppColors.purple,
      Color(0xFF3DCF7A),
      Color(0xFF5B8DEF),
      Color(0xFFE8A54B),
      Color(0xFFE85D8A),
    ];
    if (seed.isEmpty) return palette[0];
    return palette[seed.codeUnitAt(0) % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    final chats = _filtered;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A2550),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border.withValues(alpha: 0.45)),
                  ),
                  alignment: Alignment.center,
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) => setState(() => _query = value),
                    style: AppTheme.manrope(
                      color: AppColors.white,
                      fontSize: 14,
                    ),
                    cursorColor: AppColors.purple,
                    decoration: InputDecoration(
                      isDense: true,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 12,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.lightMuted,
                        size: 22,
                      ),
                      hintText: 'Search conversations...',
                      hintStyle: AppTheme.manrope(
                        color: AppColors.lightMuted,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Material(
                color: const Color(0xFF1A2550),
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Filters coming soon'),
                      ),
                    );
                  },
                  child: Container(
                    width: 48,
                    height: 48,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.border.withValues(alpha: 0.45),
                      ),
                    ),
                    child: const Icon(
                      Icons.tune_rounded,
                      color: AppColors.white,
                      size: 22,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (_bannerReady && _showSafetyBanner)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: _ChatSafetyBanner(onDismiss: _dismissSafetyBanner),
          ),
        Expanded(
          child: RefreshIndicator(
            color: AppColors.purple,
            onRefresh: widget.onRefresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
              children: [
                if (widget.conversations.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 56),
                    child: _EmptyPane(
                      icon: Icons.chat_bubble_outline_rounded,
                      title: 'No chats yet',
                      subtitle:
                          'Message a connection to start a conversation. Mutual connections can chat anytime.',
                    ),
                  )
                else if (chats.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 56),
                    child: _EmptyPane(
                      icon: Icons.search_off_rounded,
                      title: 'No matches',
                      subtitle: 'No conversations match “$_query”.',
                    ),
                  )
                else
                  ...chats.map(
                    (chat) => _ChatInboxRow(
                      chat: chat,
                      timeLabel: _formatTime(chat.lastMessageAt),
                      avatarColor: _avatarColor(
                        chat.peerCompanyName.isNotEmpty
                            ? chat.peerCompanyName
                            : chat.peerName,
                      ),
                      onTap: () => widget.onOpenChat(chat),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ChatInboxRow extends StatelessWidget {
  const _ChatInboxRow({
    required this.chat,
    required this.timeLabel,
    required this.avatarColor,
    required this.onTap,
  });

  final ChatConversation chat;
  final String timeLabel;
  final Color avatarColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final photo = chat.peerProfilePhotoUrl;
    final unread = chat.unreadCount > 0;
    final preview = chat.lastMessage.isEmpty
        ? 'Start the conversation'
        : chat.lastMessage;
    final initial = chat.peerName.isNotEmpty
        ? chat.peerName[0].toUpperCase()
        : (chat.peerCompanyName.isNotEmpty
            ? chat.peerCompanyName[0].toUpperCase()
            : '?');

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: avatarColor.withValues(alpha: 0.85),
                backgroundImage:
                    photo != null ? NetworkImage(photo) : null,
                child: photo == null
                    ? Text(
                        initial,
                        style: AppTheme.manrope(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chat.peerName,
                      style: AppTheme.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      preview,
                      style: AppTheme.manrope(
                        fontSize: 13,
                        height: 1.3,
                        fontWeight:
                            unread ? FontWeight.w600 : FontWeight.w400,
                        color: unread
                            ? AppColors.textSecondary
                            : AppColors.lightMuted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (timeLabel.isNotEmpty)
                    Text(
                      timeLabel,
                      style: AppTheme.manrope(
                        fontSize: 12,
                        color: AppColors.lightMuted,
                      ),
                    ),
                  if (unread) ...[
                    const SizedBox(height: 8),
                    Container(
                      height: 22,
                      constraints: const BoxConstraints(minWidth: 22),
                      padding: const EdgeInsets.symmetric(horizontal: 7),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.purple,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      child: Text(
                        chat.unreadCount > 99
                            ? '99+'
                            : '${chat.unreadCount}',
                        style: AppTheme.manrope(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ChatSafetyBanner extends StatelessWidget {
  const _ChatSafetyBanner({required this.onDismiss});

  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1A2550),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.purple.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.lock_outline_rounded,
              color: AppColors.purple,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Only connected users can message.',
                    style: AppTheme.manrope(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Stay safe & keep building meaningful connections!',
                    style: AppTheme.manrope(
                      fontSize: 12,
                      height: 1.4,
                      color: AppColors.mutedText,
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            onPressed: onDismiss,
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            icon: const Icon(
              Icons.close_rounded,
              size: 18,
              color: AppColors.lightMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _ConnectionsPane extends StatelessWidget {
  const _ConnectionsPane({
    required this.connections,
    required this.onRefresh,
    required this.onOpenProfile,
    required this.onMessage,
  });

  final List<ConnectionUserPreview> connections;
  final Future<void> Function() onRefresh;
  final ValueChanged<ConnectionUserPreview> onOpenProfile;
  final ValueChanged<ConnectionUserPreview> onMessage;

  @override
  Widget build(BuildContext context) {
    if (connections.isEmpty) {
      return RefreshIndicator(
        color: AppColors.purple,
        onRefresh: onRefresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: const [
            SizedBox(height: 120),
            _EmptyPane(
              icon: Icons.people_outline_rounded,
              title: 'No connections yet',
              subtitle:
                  'Accept requests or connect from Home to grow your network.',
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.purple,
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        itemCount: connections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final user = connections[index];
          return Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadius.md),
              onTap: () => onOpenProfile(user),
              child: GlassContainer(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    _UserAvatar(user: user, radius: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: AppTheme.manrope(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                          ),
                          if (user.roleCompany.isNotEmpty)
                            Text(
                              user.roleCompany,
                              style: AppTheme.manrope(
                                fontSize: 13,
                                color: AppColors.mutedText,
                              ),
                            ),
                        ],
                      ),
                    ),
                    _RoundActionButton(
                      color: AppColors.accent,
                      icon: Icons.chat_bubble_outline_rounded,
                      onTap: () => onMessage(user),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.onDismiss});

  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.fromLTRB(14, 14, 8, 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.purple.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock_outline_rounded,
              color: AppColors.purple,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                'Connect with professionals by swiping. When a connection is mutual, messaging will be unlocked automatically.',
                style: AppTheme.manrope(
                  fontSize: 13,
                  height: 1.45,
                  color: AppColors.mutedText,
                ),
              ),
            ),
          ),
          IconButton(
            onPressed: onDismiss,
            visualDensity: VisualDensity.compact,
            icon: const Icon(
              Icons.close_rounded,
              size: 18,
              color: AppColors.lightMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _SwipeRejectBackground extends StatelessWidget {
  const _SwipeRejectBackground();

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFFE85D5D).withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: const Color(0x66E85D5D)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            'Decline',
            style: AppTheme.manrope(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFE85D5D),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.close_rounded, color: Color(0xFFE85D5D), size: 22),
        ],
      ),
    );
  }
}

class _ApprovalUpdateCard extends StatelessWidget {
  const _ApprovalUpdateCard({
    required this.update,
    required this.onDismiss,
  });

  final ConnectionNotificationItem update;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final isApproved = update.isAccepted;
    final accent =
        isApproved ? const Color(0xFF3DCF7A) : const Color(0xFFE85D5D);
    final message = update.body.isNotEmpty
        ? update.body
        : isApproved
            ? '${update.fromUserName} has approved your connection request'
            : '${update.fromUserName} declined your connection request';

    return GlassContainer(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: accent.withValues(alpha: 0.25),
            backgroundImage: update.fromProfilePhotoUrl != null
                ? NetworkImage(update.fromProfilePhotoUrl!)
                : null,
            child: update.fromProfilePhotoUrl == null
                ? Text(
                    update.fromUserName.isNotEmpty
                        ? update.fromUserName[0].toUpperCase()
                        : '?',
                    style: AppTheme.manrope(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: accent.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        isApproved ? 'Approved' : 'Declined',
                        style: AppTheme.manrope(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: accent,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  update.fromUserName,
                  style: AppTheme.manrope(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  message,
                  style: AppTheme.manrope(
                    fontSize: 13,
                    height: 1.35,
                    color: AppColors.mutedText,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: onDismiss,
            visualDensity: VisualDensity.compact,
            icon: const Icon(
              Icons.close_rounded,
              size: 18,
              color: AppColors.lightMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  const _RequestCard({
    required this.request,
    required this.onAccept,
    required this.onOpen,
  });

  final ConnectionRequestItem request;
  final VoidCallback onAccept;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final user = request.user;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onOpen,
        child: GlassContainer(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _UserAvatar(user: user, radius: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            user.name,
                            style: AppTheme.manrope(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.verified_rounded,
                          size: 16,
                          color: AppColors.purple,
                        ),
                      ],
                    ),
                    if (user.roleCompany.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        user.roleCompany,
                        style: AppTheme.manrope(
                          fontSize: 13,
                          color: AppColors.mutedText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (user.location.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 14,
                            color: AppColors.lightMuted,
                          ),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              user.location,
                              style: AppTheme.manrope(
                                fontSize: 12,
                                color: AppColors.lightMuted,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _RoundActionButton(
                color: AppColors.purple,
                icon: Icons.check_rounded,
                onTap: onAccept,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  const _UserAvatar({required this.user, required this.radius});

  final ConnectionUserPreview user;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final photo = user.profilePhotoUrl;
    final initial = user.name.isNotEmpty ? user.name[0].toUpperCase() : '?';
    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.purple.withValues(alpha: 0.25),
      backgroundImage: photo != null
          ? NetworkImage(
              photo.startsWith('http') ? photo : '${ApiConfig.baseUrl}$photo',
            )
          : null,
      child: photo == null
          ? Text(
              initial,
              style: AppTheme.manrope(
                fontSize: radius * 0.55,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
            )
          : null,
    );
  }
}

class _RoundActionButton extends StatelessWidget {
  const _RoundActionButton({
    required this.color,
    required this.icon,
    required this.onTap,
  });

  final Color color;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      shape: CircleBorder(
        side: BorderSide(color: color),
      ),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(
            icon,
            color: color.computeLuminance() > 0.45
                ? AppColors.onCta
                : AppColors.white,
            size: 20,
          ),
        ),
      ),
    );
  }
}

class _EmptyPane extends StatelessWidget {
  const _EmptyPane({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: AppColors.purple),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTheme.manrope(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: AppTheme.manrope(
                fontSize: 14,
                height: 1.45,
                color: AppColors.mutedText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
