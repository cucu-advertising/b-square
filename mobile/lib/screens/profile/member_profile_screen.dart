import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/chat_models.dart';
import '../../models/discover_profile.dart';
import '../../services/auth_service.dart';
import '../../services/connection_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/glass_container.dart';
import '../messages/chat_thread_screen.dart';

enum MemberProfileMode { request, connection, discover }

/// Full member profile opened from Requests / Connections / Discover.
class MemberProfileScreen extends StatefulWidget {
  const MemberProfileScreen({
    super.key,
    required this.userId,
    this.mode = MemberProfileMode.connection,
    this.requestId,
    this.onMessageSent,
  });

  final String userId;
  final MemberProfileMode mode;
  final String? requestId;
  final ValueChanged<ChatMessage>? onMessageSent;

  @override
  State<MemberProfileScreen> createState() => _MemberProfileScreenState();
}

class _MemberProfileScreenState extends State<MemberProfileScreen> {
  final _auth = AuthService();
  final _connections = ConnectionService();
  DiscoverProfile? _profile;
  bool _loading = true;
  bool _acting = false;
  bool _chatMutated = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final profile = await _auth.fetchUserProfile(widget.userId);
      if (!mounted) return;
      setState(() {
        _profile = profile;
        _loading = false;
      });
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this profile.';
        _loading = false;
      });
    }
  }

  Future<void> _accept() async {
    final requestId = widget.requestId;
    if (requestId == null || _acting) return;
    setState(() => _acting = true);
    try {
      await _connections.acceptRequest(requestId);
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ConnectionException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      setState(() => _acting = false);
    }
  }

  Future<void> _decline() async {
    final requestId = widget.requestId;
    if (requestId == null || _acting) return;
    setState(() => _acting = true);
    try {
      await _connections.declineRequest(requestId);
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ConnectionException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      setState(() => _acting = false);
    }
  }

  Future<void> _openLinkedIn(String url) async {
    final href = url.trim();
    if (href.isEmpty) return;
    await Clipboard.setData(ClipboardData(text: href));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('LinkedIn link copied')),
    );
  }

  void _pop() => Navigator.of(context).pop(_chatMutated);

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _pop();
      },
      child: Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      onPressed: _pop,
                      icon: const Icon(
                        Icons.arrow_back_rounded,
                        color: AppColors.white,
                      ),
                    ),
                  ),
                ),
                Expanded(child: _buildBody()),
                if (widget.mode == MemberProfileMode.request &&
                    widget.requestId != null)
                  _RequestActions(
                    busy: _acting,
                    onDecline: _decline,
                    onAccept: _accept,
                  ),
                if (widget.mode == MemberProfileMode.connection &&
                    _profile != null)
                  _MessageAction(
                    onMessage: () => _openChat(_profile!),
                  ),
              ],
            ),
          ),
        ],
      ),
    ),
    );
  }

  Future<void> _openChat(DiscoverProfile profile) async {
    final sent = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => ChatThreadScreen(
          peerUserId: profile.id,
          peerName: profile.name,
          peerPhotoUrl: profile.profilePhotoUrl,
          onMessageSent: (message) {
            _chatMutated = true;
            widget.onMessageSent?.call(message);
          },
        ),
      ),
    );
    if (sent == true) _chatMutated = true;
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.accent),
      );
    }
    if (_error != null || _profile == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _error ?? 'Profile not found',
                textAlign: TextAlign.center,
                style: AppTheme.manrope(color: AppColors.mutedText),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _load,
                child: Text(
                  'Retry',
                  style: AppTheme.manrope(
                    color: AppColors.accent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final p = _profile!;
    final companySize = p.companySize == 'Not added'
        ? 'Not added'
        : (p.companySize.contains('employee')
            ? p.companySize
            : '${p.companySize} employees');

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      children: [
        _Header(profile: p),
        const SizedBox(height: 18),
        _StatsRow(profile: p),
        const SizedBox(height: 18),
        _Section(
          title: 'About the Business',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                p.companyName,
                style: AppTheme.manrope(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 8),
              if (p.industry != 'Not added')
                _Tag(label: p.industry, color: AppColors.purple),
              const SizedBox(height: 12),
              Text(
                p.about,
                style: AppTheme.manrope(
                  fontSize: 14,
                  height: 1.45,
                  color: AppColors.mutedText,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _Meta(
                      label: 'Revenue',
                      value: p.revenueRange,
                    ),
                  ),
                  Expanded(
                    child: _Meta(
                      label: 'Size',
                      value: companySize,
                    ),
                  ),
                  Expanded(
                    child: _Meta(
                      label: 'Founded',
                      value: p.yearFounded.isEmpty ? '—' : p.yearFounded,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        if (p.lookingFor.isNotEmpty) ...[
          const SizedBox(height: 14),
          _Section(
            title: 'Interested to Connect',
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: p.lookingFor
                  .map(
                    (tag) => _Tag(
                      label: tag,
                      color: AppColors.purple,
                      selected: true,
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
        if (p.businessInterests.isNotEmpty) ...[
          const SizedBox(height: 14),
          _Section(
            title: 'Business Interests',
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: p.businessInterests
                  .map(
                    (tag) => _Tag(
                      label: tag,
                      color: const Color(0xFF3E6BD8),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
        if (p.galleryUrls.isNotEmpty) ...[
          const SizedBox(height: 14),
          _Section(
            title: 'Gallery',
            child: _GalleryGrid(urls: p.galleryUrls),
          ),
        ],
        const SizedBox(height: 14),
        _Section(
          title: 'Business Details',
          child: Text(
            p.about,
            style: AppTheme.manrope(
              fontSize: 14,
              height: 1.45,
              color: AppColors.mutedText,
            ),
          ),
        ),
        const SizedBox(height: 14),
        _Section(
          title: 'Personal Information',
          child: Column(
            children: [
              _InfoRow(label: 'Role / Designation', value: p.role),
              _InfoRow(
                label: 'Year Founded',
                value: p.yearFounded.isEmpty ? 'Not added' : p.yearFounded,
              ),
              if (p.linkedinUrl.isNotEmpty)
                _InfoRow(
                  label: 'LinkedIn',
                  value: p.linkedinUrl,
                  isLink: true,
                  onTap: () => _openLinkedIn(p.linkedinUrl),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.profile});

  final DiscoverProfile profile;

  @override
  Widget build(BuildContext context) {
    final photo = profile.profilePhotoUrl;
    final tags = <String>[
      if (profile.headline.isNotEmpty &&
          profile.headline != "I'm a Member of BSquare")
        profile.headline,
      if (profile.role.isNotEmpty) profile.role,
    ].take(2).toList();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Stack(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.secondary,
              backgroundImage: photo != null ? NetworkImage(photo) : null,
              child: photo == null
                  ? Text(
                      profile.name.isNotEmpty
                          ? profile.name[0].toUpperCase()
                          : '?',
                      style: AppTheme.manrope(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                    )
                  : null,
            ),
            Positioned(
              right: 2,
              bottom: 2,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profile.name,
                style: AppTheme.manrope(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${profile.role} at ${profile.companyName}',
                style: AppTheme.manrope(
                  fontSize: 13,
                  color: AppColors.mutedText,
                ),
              ),
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
                      profile.location,
                      style: AppTheme.manrope(
                        fontSize: 12,
                        color: AppColors.lightMuted,
                      ),
                    ),
                  ),
                ],
              ),
              if (tags.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (var i = 0; i < tags.length; i++)
                      _Tag(
                        label: tags[i],
                        color: i == 0
                            ? const Color(0xFF3E6BD8)
                            : AppColors.accent.withValues(alpha: 0.35),
                        textColor: i == 0 ? AppColors.white : AppColors.primary,
                      ),
                  ],
                ),
              ],
              if (profile.companyTagline.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  profile.companyTagline,
                  style: AppTheme.manrope(
                    fontSize: 13,
                    height: 1.4,
                    color: AppColors.mutedText,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.profile});

  final DiscoverProfile profile;

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.people_outline_rounded, 'Connections', '${profile.connections}'),
      (
        Icons.category_outlined,
        'Interests',
        '${profile.businessInterests.length}',
      ),
      (
        Icons.work_outline_rounded,
        'Founded',
        profile.yearFounded.isEmpty ? '—' : profile.yearFounded,
      ),
      (
        Icons.bolt_outlined,
        'Response',
        '${profile.responseRate}%',
      ),
    ];

    return GlassContainer(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
      child: Row(
        children: items.map((item) {
          final (icon, label, value) = item;
          return Expanded(
            child: Column(
              children: [
                Icon(icon, size: 18, color: AppColors.mutedText),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: AppTheme.manrope(
                    fontSize: 10,
                    color: AppColors.lightMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTheme.manrope(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTheme.manrope(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({
    required this.label,
    required this.color,
    this.selected = false,
    this.textColor,
  });

  final String label;
  final Color color;
  final bool selected;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? color : color.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        label,
        style: AppTheme.manrope(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor ?? AppColors.white,
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTheme.manrope(fontSize: 11, color: AppColors.lightMuted),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: AppTheme.manrope(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.isLink = false,
    this.onTap,
  });

  final String label;
  final String value;
  final bool isLink;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTheme.manrope(
                fontSize: 13,
                color: AppColors.lightMuted,
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: onTap,
              child: Text(
                value,
                style: AppTheme.manrope(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isLink ? AppColors.purple : AppColors.white,
                  height: 1.35,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GalleryGrid extends StatelessWidget {
  const _GalleryGrid({required this.urls});

  final List<String> urls;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: urls.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemBuilder: (context, index) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: Image.network(
            urls[index],
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.secondary,
              alignment: Alignment.center,
              child: const Icon(
                Icons.broken_image_outlined,
                color: AppColors.mutedText,
              ),
            ),
          ),
        );
      },
    );
  }
}

class _MessageAction extends StatelessWidget {
  const _MessageAction({required this.onMessage});

  final VoidCallback onMessage;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SizedBox(
        height: 52,
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: onMessage,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accent,
            foregroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
          ),
          icon: const Icon(Icons.chat_bubble_outline_rounded),
          label: Text(
            'Message',
            style: AppTheme.manrope(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      ),
    );
  }
}

class _RequestActions extends StatelessWidget {
  const _RequestActions({
    required this.busy,
    required this.onDecline,
    required this.onAccept,
  });

  final bool busy;
  final VoidCallback onDecline;
  final VoidCallback onAccept;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          _CircleAction(
            color: const Color(0xFFE85D5D),
            icon: Icons.close_rounded,
            onTap: busy ? null : onDecline,
          ),
          const SizedBox(width: 12),
          _CircleAction(
            color: AppColors.accent,
            icon: Icons.star_rounded,
            iconColor: AppColors.primary,
            onTap: busy
                ? null
                : () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Saved to favorites')),
                    );
                  },
          ),
          const SizedBox(width: 12),
          Expanded(
            child: SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: busy ? null : onAccept,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  foregroundColor: AppColors.primary,
                  disabledBackgroundColor:
                      AppColors.accent.withValues(alpha: 0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                ),
                icon: const Icon(Icons.check_rounded),
                label: Text(
                  busy ? 'Please wait...' : 'Connect',
                  style: AppTheme.manrope(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleAction extends StatelessWidget {
  const _CircleAction({
    required this.color,
    required this.icon,
    required this.onTap,
    this.iconColor,
  });

  final Color color;
  final IconData icon;
  final VoidCallback? onTap;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withValues(alpha: 0.18),
      shape: CircleBorder(side: BorderSide(color: color.withValues(alpha: 0.5))),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 52,
          height: 52,
          child: Icon(icon, color: iconColor ?? color, size: 24),
        ),
      ),
    );
  }
}
