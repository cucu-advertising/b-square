import 'package:flutter/material.dart';
import '../models/discover_profile.dart';
import '../theme/app_theme.dart';
import 'glass_container.dart';

class DiscoverProfileCard extends StatelessWidget {
  const DiscoverProfileCard({
    super.key,
    required this.profile,
    this.onPass,
    this.onStar,
    this.onConnect,
  });

  final DiscoverProfile profile;
  final VoidCallback? onPass;
  final VoidCallback? onStar;
  final VoidCallback? onConnect;

  @override
  Widget build(BuildContext context) {
    final accent = Color(profile.avatarColor ?? 0xFF7C6CFF);

    return GlassContainer(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 12, 12),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.glassBorder),
                    image: profile.companyLogoUrl != null
                        ? DecorationImage(
                            image: NetworkImage(profile.companyLogoUrl!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: profile.companyLogoUrl == null
                      ? Text(
                          profile.companyName.isNotEmpty
                              ? profile.companyName[0]
                              : '?',
                          style: AppTheme.manrope(
                            fontSize: 18,
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
                      Text(
                        profile.companyName,
                        style: AppTheme.manrope(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      ),
                      Text(
                        profile.companyTagline,
                        style: AppTheme.manrope(
                          fontSize: 12,
                          color: AppColors.mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    border: Border.all(color: AppColors.glassBorder),
                  ),
                  child: Text(
                    profile.badge,
                    style: AppTheme.manrope(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.mutedText,
                    ),
                  ),
                ),
              ],
            ),
          ),
          _PhotoSection(profile: profile, accent: accent),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                _DetailRow(
                  icon: Icons.category_outlined,
                  label: 'Industry',
                  value: profile.industry,
                ),
                _DetailRow(
                  icon: Icons.currency_rupee_rounded,
                  label: 'Annual revenue range',
                  value: profile.revenueRange,
                ),
                _DetailRow(
                  icon: Icons.groups_outlined,
                  label: 'Company size',
                  value: profile.companySize,
                ),
                if (profile.lookingFor.isNotEmpty)
                  _TagSection(
                    icon: Icons.link_rounded,
                    label: 'Interested to connect',
                    tags: profile.lookingFor,
                    colors: const [
                      Color(0x33D4FF3A),
                      Color(0x337C6CFF),
                      Color(0x334A90D9),
                    ],
                  ),
                if (profile.businessInterests.isNotEmpty)
                  _TagSection(
                    icon: Icons.interests_outlined,
                    label: 'Business interests',
                    tags: profile.businessInterests,
                    colors: const [
                      Color(0x33D4FF3A),
                      Color(0x337C6CFF),
                      Color(0x33E8A87C),
                      Color(0x334A90D9),
                    ],
                  ),
                _DetailRow(
                  icon: Icons.info_outline_rounded,
                  label: 'About the business',
                  value: profile.about,
                  multiline: true,
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _ActionButton(
                  icon: Icons.close_rounded,
                  color: const Color(0xFFE85D5D),
                  onTap: onPass,
                ),
                const SizedBox(width: 20),
                _ActionButton(
                  icon: Icons.star_rounded,
                  color: AppColors.purple,
                  onTap: onStar,
                ),
                const SizedBox(width: 20),
                _ActionButton(
                  icon: Icons.check_rounded,
                  color: AppColors.lime,
                  iconColor: AppColors.primary,
                  onTap: onConnect,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PhotoSection extends StatefulWidget {
  const _PhotoSection({required this.profile, required this.accent});

  final DiscoverProfile profile;
  final Color accent;

  @override
  State<_PhotoSection> createState() => _PhotoSectionState();
}

class _PhotoSectionState extends State<_PhotoSection> {
  int _page = 0;

  List<String> get _images {
    // Guard against stale hot-reload instances where lists can be null.
    final gallery = widget.profile.galleryUrls;
    if (gallery.isNotEmpty) return List<String>.from(gallery);
    final fallback =
        widget.profile.coverPhotoUrl ?? widget.profile.profilePhotoUrl;
    return fallback != null ? <String>[fallback] : const <String>[];
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    final accent = widget.accent;
    final images = _images;

    return SizedBox(
      height: 220,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (images.isEmpty)
            _FallbackPhoto(profile: profile, accent: accent)
          else
            PageView.builder(
              itemCount: images.length,
              onPageChanged: (index) => setState(() => _page = index),
              itemBuilder: (context, index) {
                return Image.network(
                  images[index],
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      _FallbackPhoto(profile: profile, accent: accent),
                );
              },
            ),
          if (images.length > 1)
            Positioned(
              top: 12,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(images.length, (index) {
                  final active = index == _page;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: active ? 16 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.accent
                          : AppColors.white.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  );
                }),
              ),
            ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 40, 16, 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppColors.primary.withValues(alpha: 0.85),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          profile.name,
                          style: AppTheme.manrope(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(
                        Icons.verified_rounded,
                        color: AppColors.purple,
                        size: 20,
                      ),
                    ],
                  ),
                  Text(
                    profile.role,
                    style: AppTheme.manrope(
                      fontSize: 14,
                      color: AppColors.mutedText,
                    ),
                  ),
                  Text(
                    profile.companyName,
                    style: AppTheme.manrope(
                      fontSize: 13,
                      color: AppColors.lightMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(height: 1, color: AppColors.glassBorder),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: AppColors.mutedText,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        profile.location,
                        style: AppTheme.manrope(
                          fontSize: 13,
                          color: AppColors.mutedText,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FallbackPhoto extends StatelessWidget {
  const _FallbackPhoto({required this.profile, required this.accent});

  final DiscoverProfile profile;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            accent.withValues(alpha: 0.5),
            AppColors.primary,
          ],
        ),
      ),
      child: Center(
        child: Text(
          profile.name.isNotEmpty ? profile.name[0] : '?',
          style: AppTheme.manrope(
            fontSize: 72,
            fontWeight: FontWeight.w700,
            color: AppColors.white.withValues(alpha: 0.25),
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.multiline = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool multiline;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment:
            multiline ? CrossAxisAlignment.start : CrossAxisAlignment.center,
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
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: AppTheme.manrope(
                    fontSize: 13,
                    height: multiline ? 1.45 : 1.2,
                    color: AppColors.mutedText,
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

class _TagSection extends StatelessWidget {
  const _TagSection({
    required this.icon,
    required this.label,
    required this.tags,
    required this.colors,
  });

  final IconData icon;
  final String label;
  final List<String> tags;
  final List<Color> colors;

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
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: List.generate(tags.length, (i) {
                    final bg = colors[i % colors.length];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: Text(
                        tags[i],
                        style: AppTheme.manrope(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.white,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.color,
    this.iconColor,
    this.onTap,
  });

  final IconData icon;
  final Color color;
  final Color? iconColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.glassFill,
          border: Border.all(color: AppColors.glassBorder),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.2),
              blurRadius: 12,
            ),
          ],
        ),
        child: Icon(icon, color: iconColor ?? color, size: 26),
      ),
    );
  }
}
