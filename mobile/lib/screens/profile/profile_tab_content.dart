import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../models/signup_data.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../services/connection_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/pill_button.dart';
import '../welcome_screen.dart';
import 'edit_profile_screen.dart';
import 'share_profile_screen.dart';

class ProfileTabContent extends StatefulWidget {
  const ProfileTabContent({super.key, required this.data});

  final SignupData data;

  @override
  State<ProfileTabContent> createState() => _ProfileTabContentState();
}

class _ProfileTabContentState extends State<ProfileTabContent> {
  final _authService = AuthService();
  final _connectionService = ConnectionService();
  bool _aboutExpanded = false;
  bool _isLoggingOut = false;
  ProfileStats _stats = ProfileStats.empty;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final stats = await _connectionService.fetchProfileStats();
      if (!mounted) return;
      setState(() => _stats = stats);
    } on ConnectionException {
      // Keep zeros if stats fail.
    }
  }

  String get _displayName {
    final founder = widget.data.founderName.trim();
    if (founder.isNotEmpty) return founder;
    return widget.data.fullName.trim().isNotEmpty
        ? widget.data.fullName.trim()
        : 'Your name';
  }

  String get _companyName {
    final company = widget.data.companyName.trim();
    if (company.isNotEmpty) return company;
    return widget.data.businessName.trim().isNotEmpty
        ? widget.data.businessName.trim()
        : 'Your company';
  }

  String get _headline {
    final role = widget.data.role.trim();
    if (role.isNotEmpty) return role;
    final headline = widget.data.headline.trim();
    if (headline.isNotEmpty && headline != "I'm a Member of BSquare") {
      return headline;
    }
    for (final goal in AppConstants.businessGoals) {
      if (goal.value == widget.data.businessGoal) return goal.label;
    }
    return 'Business professional';
  }

  String _value(String value, {String fallback = 'Not added'}) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? fallback : trimmed;
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.data;
    final location = data.city.trim().isEmpty
        ? 'Location not added'
        : '${data.city.trim()}, India';
    final about = _value(data.bio, fallback: 'Add a short intro about yourself.');
    final companySize = data.companySize.trim().isEmpty
        ? 'Not added'
        : '${data.companySize.trim()} employees';

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _CoverHeader(
            coverBytes: data.businessGalleryBytes.isNotEmpty
                ? data.businessGalleryBytes.first
                : null,
            coverUrl: data.businessGalleryUrls.isNotEmpty
                ? data.businessGalleryUrls.first
                : null,
            photoBytes: data.profilePhotoBytes,
            photoUrl: data.profilePhotoUrl,
            logoBytes: data.companyLogoBytes,
            logoUrl: data.companyLogoUrl,
            displayName: _displayName,
            headline: _headline,
            companyName: _companyName,
            location: location,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: PillButton(
                        label: 'Edit profile',
                        leading: const Icon(Icons.edit_outlined, size: 18),
                        onPressed: () async {
                          await Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => const EditProfileScreen(),
                            ),
                          );
                          if (mounted) await _loadStats();
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: PillButton(
                        label: 'Share',
                        glass: true,
                        foregroundColor: AppColors.white,
                        leading: const Icon(Icons.ios_share_rounded, size: 18),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => ShareProfileScreen(
                                data: widget.data,
                                stats: _stats,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _StatsCard(stats: _stats),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'About',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        about,
                        maxLines: _aboutExpanded ? null : 3,
                        overflow: _aboutExpanded ? null : TextOverflow.ellipsis,
                        style: AppTheme.manrope(
                          fontSize: 14,
                          height: 1.5,
                          color: AppColors.mutedText,
                        ),
                      ),
                      if (about.length > 120) ...[
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: () =>
                                setState(() => _aboutExpanded = !_aboutExpanded),
                            child: Text(
                              _aboutExpanded ? 'See less' : 'See more',
                              style: AppTheme.manrope(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.purple,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                _SectionCard(
                  title: 'Business details',
                  child: Column(
                    children: [
                      _DetailRow(
                        icon: Icons.category_outlined,
                        label: 'Industry',
                        value: _value(data.industry),
                      ),
                      _DetailRow(
                        icon: Icons.currency_rupee_rounded,
                        label: 'Annual revenue range',
                        value: _value(data.revenueRange),
                      ),
                      _DetailRow(
                        icon: Icons.groups_outlined,
                        label: 'Company size',
                        value: companySize,
                      ),
                      _DetailRow(
                        icon: Icons.work_outline_rounded,
                        label: 'Founded',
                        value: _value(data.yearFounded),
                      ),
                    ],
                  ),
                ),
                if (data.lookingFor.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Interested to connect',
                    child: _TagWrap(tags: data.lookingFor),
                  ),
                ],
                if (data.businessInterests.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Business interests',
                    child: _TagWrap(tags: data.businessInterests),
                  ),
                ],
                if (data.businessGalleryBytes.isNotEmpty ||
                    data.businessGalleryUrls.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Gallery',
                    child: _GalleryGrid(
                      imageBytes: data.businessGalleryBytes,
                      imageUrls: data.businessGalleryUrls,
                    ),
                  ),
                ],
                const SizedBox(height: 28),
                PillButton(
                  label: _isLoggingOut ? 'Logging out...' : 'Log out',
                  glass: true,
                  foregroundColor: const Color(0xFFE85D5D),
                  leading: _isLoggingOut
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Color(0xFFE85D5D),
                          ),
                        )
                      : const Icon(Icons.logout_rounded, size: 18),
                  onPressed: _isLoggingOut ? () {} : () => _logout(context),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _logout(BuildContext context) async {
    setState(() => _isLoggingOut = true);
    try {
      await _authService.logout();
      if (!context.mounted) return;
      context.read<SignupFlowProvider>().clear();
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const WelcomeScreen()),
        (_) => false,
      );
    } catch (_) {
      if (!context.mounted) return;
      _showSnack(context, 'Could not log out. Please try again.');
      setState(() => _isLoggingOut = false);
    }
  }

  void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _CoverHeader extends StatelessWidget {
  const _CoverHeader({
    required this.coverBytes,
    required this.coverUrl,
    required this.photoBytes,
    required this.photoUrl,
    required this.logoBytes,
    required this.logoUrl,
    required this.displayName,
    required this.headline,
    required this.companyName,
    required this.location,
  });

  final Uint8List? coverBytes;
  final String? coverUrl;
  final Uint8List? photoBytes;
  final String? photoUrl;
  final Uint8List? logoBytes;
  final String? logoUrl;
  final String displayName;
  final String headline;
  final String companyName;
  final String location;

  ImageProvider? get _coverImage {
    if (coverBytes != null) return MemoryImage(coverBytes!);
    if (coverUrl != null) return NetworkImage(coverUrl!);
    return null;
  }

  ImageProvider? get _photoImage {
    if (photoBytes != null) return MemoryImage(photoBytes!);
    if (photoUrl != null) return NetworkImage(photoUrl!);
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final coverImage = _coverImage;
    final photoImage = _photoImage;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        SizedBox(
          height: 150,
          width: double.infinity,
          child: coverImage != null
              ? Image(image: coverImage, fit: BoxFit.cover)
              : Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppColors.indigo.withValues(alpha: 0.45),
                        AppColors.primary,
                        AppColors.lime.withValues(alpha: 0.18),
                      ],
                    ),
                  ),
                ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 110, 20, 0),
          child: Column(
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primary, width: 4),
                ),
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: AppColors.glassFill,
                  backgroundImage: photoImage,
                  child: photoImage == null
                      ? Text(
                          displayName.isNotEmpty
                              ? displayName[0].toUpperCase()
                              : '?',
                          style: AppTheme.manrope(
                            fontSize: 32,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                displayName,
                textAlign: TextAlign.center,
                style: AppTheme.manrope(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  _CompanyLogo(
                    logoBytes: logoBytes,
                    logoUrl: logoUrl,
                    companyName: companyName,
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      '$headline • $companyName',
                      textAlign: TextAlign.center,
                      style: AppTheme.manrope(
                        fontSize: 13,
                        color: AppColors.mutedText,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: AppColors.lightMuted,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    location,
                    style: AppTheme.manrope(
                      fontSize: 13,
                      color: AppColors.lightMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CompanyLogo extends StatelessWidget {
  const _CompanyLogo({
    required this.logoBytes,
    required this.logoUrl,
    required this.companyName,
  });

  final Uint8List? logoBytes;
  final String? logoUrl;
  final String companyName;

  @override
  Widget build(BuildContext context) {
    if (logoBytes != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Image.memory(logoBytes!, width: 20, height: 20, fit: BoxFit.cover),
      );
    }
    if (logoUrl != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: Image.network(logoUrl!, width: 20, height: 20, fit: BoxFit.cover),
      );
    }

    return Container(
      width: 20,
      height: 20,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.lime.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        companyName.isNotEmpty ? companyName[0].toUpperCase() : 'B',
        style: AppTheme.manrope(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.lime,
        ),
      ),
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard({required this.stats});

  final ProfileStats stats;

  @override
  Widget build(BuildContext context) {
    final items = [
      (
        Icons.people_outline_rounded,
        'Connections',
        '${stats.connections}',
      ),
      (
        Icons.visibility_outlined,
        'Profile views',
        '${stats.profileViews}',
      ),
      (
        Icons.shield_outlined,
        'Matches',
        '${stats.matches}',
      ),
      (
        Icons.star_outline_rounded,
        'Response rate',
        '${stats.responseRate}%',
      ),
    ];

    return GlassContainer(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Row(
        children: items.map((stat) {
          final (icon, label, value) = stat;
          return Expanded(
            child: Column(
              children: [
                Icon(icon, size: 20, color: AppColors.mutedText),
                const SizedBox(height: 6),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: AppTheme.manrope(
                    fontSize: 10,
                    color: AppColors.lightMuted,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: AppTheme.manrope(
                    fontSize: 16,
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

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

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

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.mutedText),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTheme.manrope(
                    fontSize: 12,
                    color: AppColors.lightMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTheme.manrope(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TagWrap extends StatelessWidget {
  const _TagWrap({required this.tags});

  final List<String> tags;

  static const _colors = [
    Color(0x33D4FF3A),
    Color(0x337C6CFF),
    Color(0x33E8A87C),
    Color(0x334A90D9),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: List.generate(tags.length, (i) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: _colors[i % _colors.length],
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: AppColors.glassBorder),
          ),
          child: Text(
            tags[i],
            style: AppTheme.manrope(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.white,
            ),
          ),
        );
      }),
    );
  }
}

class _GalleryGrid extends StatelessWidget {
  const _GalleryGrid({
    required this.imageBytes,
    required this.imageUrls,
  });

  final List<Uint8List> imageBytes;
  final List<String> imageUrls;

  int get _count {
    if (imageUrls.isNotEmpty) return imageUrls.length;
    return imageBytes.length;
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _count,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemBuilder: (context, index) {
        final Widget image;
        if (imageUrls.isNotEmpty) {
          image = Image.network(
            imageUrls[index],
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.glassFill,
              alignment: Alignment.center,
              child: const Icon(
                Icons.broken_image_outlined,
                color: AppColors.mutedText,
              ),
            ),
          );
        } else {
          image = Image.memory(imageBytes[index], fit: BoxFit.cover);
        }

        return ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: image,
        );
      },
    );
  }
}
