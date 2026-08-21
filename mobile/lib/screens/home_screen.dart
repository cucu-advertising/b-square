import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_models.dart';
import '../models/connection_request.dart';
import '../models/discover_profile.dart';
import '../models/signup_data.dart';
import '../providers/signup_flow_provider.dart';
import '../services/auth_service.dart';
import '../services/chat_service.dart';
import '../services/chat_socket.dart';
import '../services/connection_service.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_background.dart';
import '../widgets/discover_profile_card.dart';
import '../widgets/nav_bar_icons.dart';
import '../widgets/notification_permission_dialog.dart';
import 'messages/messages_tab_content.dart';
import 'profile/profile_tab_content.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _authService = AuthService();
  final _connectionService = ConnectionService();
  final _chatService = ChatService();
  int _navIndex = 0;
  int _messagesBadge = 0;
  int _cardIndex = 0;
  List<DiscoverProfile> _profiles = [];
  bool _loadingProfiles = true;
  bool _sendingRequest = false;
  String? _profilesError;
  StreamSubscription<Map<String, dynamic>>? _socketSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) NotificationPermissionDialog.show(context);
    });
    _loadDiscoverProfiles();
    _refreshMessagesBadge();
    unawaited(ChatSocket.instance.connect());
    _socketSub = ChatSocket.instance.events.listen(_onSocketEvent);
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    super.dispose();
  }

  void _onSocketEvent(Map<String, dynamic> event) {
    final type = event['type']?.toString();
    if (type == 'message.new' || type == 'message.read') {
      _refreshMessagesBadge();
    }
  }

  Future<void> _refreshMessagesBadge() async {
    try {
      final results = await Future.wait([
        _chatService.fetchConversations(),
        _connectionService.fetchReceivedRequests(),
        _connectionService.fetchNotifications(),
      ]);
      if (!mounted) return;
      final conversations = results[0] as List<ChatConversation>;
      final requests = results[1] as List<ConnectionRequestItem>;
      final notifications = results[2] as List<ConnectionNotificationItem>;
      final unreadChats =
          conversations.fold<int>(0, (sum, c) => sum + c.unreadCount);
      final requestUpdates = notifications
          .where((n) => (n.isAccepted || n.isDeclined) && !n.isRead)
          .length;
      setState(() {
        _messagesBadge = unreadChats + requests.length + requestUpdates;
      });
    } catch (_) {
      // Keep last known badge if refresh fails.
    }
  }

  Future<void> _loadDiscoverProfiles() async {
    setState(() {
      _loadingProfiles = true;
      _profilesError = null;
    });
    try {
      final profiles = await _authService.fetchDiscoverProfiles();
      if (!mounted) return;
      setState(() {
        _profiles = profiles;
        _cardIndex = 0;
        _loadingProfiles = false;
      });
      if (profiles.isNotEmpty) {
        _recordCurrentProfileView();
      }
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() {
        _profiles = [];
        _profilesError = e.message;
        _loadingProfiles = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _profiles = [];
        _profilesError = 'Could not load members right now.';
        _loadingProfiles = false;
      });
    }
  }

  String _formattedDate() {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final now = DateTime.now();
    return '${weekdays[now.weekday - 1]}, ${months[now.month - 1]} ${now.day}';
  }

  void _removeCurrentProfile() {
    if (_profiles.isEmpty) return;
    setState(() {
      _profiles.removeAt(_cardIndex % _profiles.length);
      if (_profiles.isNotEmpty) {
        _cardIndex = _cardIndex % _profiles.length;
      } else {
        _cardIndex = 0;
      }
    });
    if (_profiles.isNotEmpty) {
      _recordCurrentProfileView();
    }
  }

  Future<void> _passProfile(DiscoverProfile profile) async {
    _removeCurrentProfile();
    if (profile.id.isEmpty) return;
    try {
      await _connectionService.passProfile(profile.id);
    } on ConnectionException {
      // Already removed locally; keep feed moving silently.
    }
  }

  void _onNavTap(int index) {
    final previous = _navIndex;
    setState(() => _navIndex = index);
    if (previous == 2 || index != 2) {
      _refreshMessagesBadge();
    }
  }

  void _onMessagesBadgeChanged(int count) {
    if (_messagesBadge == count) return;
    setState(() => _messagesBadge = count);
  }

  Widget _buildTabMessage({
    required IconData icon,
    required String message,
    bool title = false,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: AppColors.purple),
            const SizedBox(height: 20),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTheme.manrope(
                fontSize: title ? 24 : 16,
                height: 1.5,
                fontWeight: title ? FontWeight.w700 : FontWeight.w400,
                color: title ? AppColors.white : AppColors.mutedText,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiscoverBody() {
    if (_loadingProfiles) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.purple),
      );
    }

    if (_profilesError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _profilesError!,
                textAlign: TextAlign.center,
                style: AppTheme.manrope(color: AppColors.mutedText, fontSize: 15),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _loadDiscoverProfiles,
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

    if (_profiles.isEmpty) {
      return _buildTabMessage(
        icon: Icons.people_outline_rounded,
        message:
            'No other members yet. As people register on BSquare, their profiles will appear here.',
      );
    }

    final profile = _profiles[_cardIndex % _profiles.length];
    return RefreshIndicator(
      color: AppColors.purple,
      onRefresh: _loadDiscoverProfiles,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        child: DiscoverProfileCard(
          profile: profile,
          onPass: () => _passProfile(profile),
          onStar: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Saved to favorites')),
            );
          },
          onConnect: _sendingRequest
              ? null
              : () => _sendConnectionRequest(profile),
        ),
      ),
    );
  }

  void _recordCurrentProfileView() {
    if (_profiles.isEmpty) return;
    final profile = _profiles[_cardIndex % _profiles.length];
    _connectionService.recordProfileView(profile.id);
  }

  Future<void> _sendConnectionRequest(DiscoverProfile profile) async {
    if (_sendingRequest || profile.id.isEmpty) return;
    setState(() => _sendingRequest = true);
    try {
      await _connectionService.sendRequest(profile.id);
      if (!mounted) return;
      _removeCurrentProfile();
    } on ConnectionException {
      if (mounted) _removeCurrentProfile();
    } finally {
      if (mounted) setState(() => _sendingRequest = false);
    }
  }

  Widget _buildBody(SignupData user) {
    return switch (_navIndex) {
      1 => _buildTabMessage(
          icon: Icons.event_outlined,
          message: 'Coming Soon',
          title: true,
        ),
      2 => MessagesTabContent(onBadgeCountChanged: _onMessagesBadgeChanged),
      3 => ProfileTabContent(data: user),
      _ => _buildDiscoverBody(),
    };
  }

  bool get _showHomeHeader => _navIndex == 0 || _navIndex == 1;

  @override
  Widget build(BuildContext context) {
    final user = context.watch<SignupFlowProvider>().data;
    final firstName = user.firstName.trim().isNotEmpty
        ? user.firstName.trim()
        : (user.fullName.split(' ').isNotEmpty
            ? user.fullName.split(' ').first
            : 'there');
    final city = user.city.trim().isNotEmpty ? user.city : 'Hyderabad';

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Column(
              children: [
                if (_showHomeHeader) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _formattedDate(),
                                    style: AppTheme.manrope(
                                      fontSize: 13,
                                      color: AppColors.mutedText,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.location_on_rounded,
                                        color: Color(0xFFE85D5D),
                                        size: 20,
                                      ),
                                      const SizedBox(width: 4),
                                      Flexible(
                                        child: Text(
                                          city,
                                          textAlign: TextAlign.center,
                                          style: AppTheme.manrope(
                                            fontSize: 22,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.white,
                                            letterSpacing: -0.5,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(
                              width: 40,
                              height: 40,
                              child: Center(
                                child: _UserAvatar(
                                  name: firstName,
                                  photo: user.profilePhotoBytes,
                                  photoUrl: user.profilePhotoUrl,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '✨ A few things for you, $firstName',
                          style: AppTheme.manrope(
                            fontSize: 16,
                            color: AppColors.mutedText,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                Expanded(child: _buildBody(user)),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _HomeBottomNav(
        currentIndex: _navIndex,
        messagesBadge: _messagesBadge,
        onTap: _onNavTap,
      ),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  const _UserAvatar({required this.name, this.photo, this.photoUrl});

  final String name;
  final Uint8List? photo;
  final String? photoUrl;

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';
    final ImageProvider? image = photo != null
        ? MemoryImage(photo!)
        : (photoUrl != null ? NetworkImage(photoUrl!) : null);

    if (image != null) {
      return CircleAvatar(
        radius: 20,
        backgroundImage: image,
      );
    }

    return CircleAvatar(
      radius: 20,
      backgroundColor: AppColors.purple.withValues(alpha: 0.3),
      child: Text(
        initial,
        style: AppTheme.manrope(
          fontWeight: FontWeight.w700,
          color: AppColors.white,
        ),
      ),
    );
  }
}

class _HomeBottomNav extends StatelessWidget {
  const _HomeBottomNav({
    required this.currentIndex,
    required this.messagesBadge,
    required this.onTap,
  });

  final int currentIndex;
  final int messagesBadge;
  final ValueChanged<int> onTap;

  static const _items = [
    (NavBarIconType.home, 'Home'),
    (NavBarIconType.events, 'Events'),
    (NavBarIconType.messages, 'Messages'),
    (NavBarIconType.profile, 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.primary,
        border: Border(top: BorderSide(color: AppColors.glassBorder)),
      ),
      child: SafeArea(
        top: false,
        minimum: const EdgeInsets.only(bottom: 4),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 6, 8, 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_items.length, (i) {
              final (iconType, label) = _items[i];
              final active = currentIndex == i;
              final showBadge =
                  iconType == NavBarIconType.messages && messagesBadge > 0;
              return GestureDetector(
                onTap: () => onTap(i),
                behavior: HitTestBehavior.opaque,
                child: SizedBox(
                  width: 72,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          NavBarIcon(
                            type: iconType,
                            filled: active,
                            color:
                                active ? AppColors.accent : AppColors.lightMuted,
                            size: 22,
                          ),
                          if (showBadge)
                            Positioned(
                              right: -8,
                              top: -6,
                              child: Container(
                                constraints: const BoxConstraints(
                                  minWidth: 16,
                                  minHeight: 16,
                                ),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE53935),
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.pill),
                                  border: Border.all(
                                    color: AppColors.primary,
                                    width: 1.5,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  messagesBadge > 99
                                      ? '99+'
                                      : '$messagesBadge',
                                  style: AppTheme.manrope(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.white,
                                    height: 1,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        label,
                        style: AppTheme.manrope(
                          fontSize: 11,
                          height: 1.1,
                          fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                          color: active ? AppColors.accent : AppColors.lightMuted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        width: active ? 28 : 0,
                        height: active ? 2 : 0,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
