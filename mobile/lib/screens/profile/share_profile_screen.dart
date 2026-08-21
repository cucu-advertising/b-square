import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../../models/signup_data.dart';
import '../../services/connection_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';

class ShareProfileScreen extends StatefulWidget {
  const ShareProfileScreen({
    super.key,
    required this.data,
    required this.stats,
  });

  final SignupData data;
  final ProfileStats stats;

  @override
  State<ShareProfileScreen> createState() => _ShareProfileScreenState();
}

class _ShareProfileScreenState extends State<ShareProfileScreen> {
  final _cardKeys = List.generate(3, (_) => GlobalKey());
  final _pageController = PageController();
  int _page = 0;
  bool _busy = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  String get _profileLink {
    final id = widget.data.id.trim();
    if (id.isEmpty) return 'https://bsquare.app/profile';
    return 'https://bsquare.app/u/$id';
  }

  String get _displayName {
    final founder = widget.data.founderName.trim();
    if (founder.isNotEmpty) return founder;
    final name = widget.data.fullName.trim();
    if (name.isNotEmpty) return name;
    return 'Member';
  }

  String get _company {
    final company = widget.data.companyName.trim();
    if (company.isNotEmpty) return company;
    return widget.data.businessName.trim();
  }

  String _formatViews(int views) {
    if (views >= 1000000) {
      final v = views / 1000000;
      return v >= 10 ? '${v.round()}M' : '${v.toStringAsFixed(1)}M';
    }
    if (views >= 1000) {
      final v = views / 1000;
      return v >= 10
          ? '${v.round()}K'
          : (v == v.roundToDouble()
              ? '${v.round()}K'
              : '${v.toStringAsFixed(1)}K');
    }
    return '$views';
  }

  String _dateRangeLabel() {
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];
    final end = DateTime.now();
    final start = end.subtract(const Duration(days: 29));
    return '${months[start.month - 1]} ${start.day} - ${months[end.month - 1]} ${end.day} ${end.year}';
  }

  ImageProvider? get _photo {
    final bytes = widget.data.profilePhotoBytes;
    if (bytes != null) return MemoryImage(bytes);
    final url = widget.data.profilePhotoUrl;
    if (url != null && url.isNotEmpty) return NetworkImage(url);
    return null;
  }

  void _snack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _copyLink() async {
    await Clipboard.setData(ClipboardData(text: _profileLink));
    if (!mounted) return;
    _snack('Profile link copied');
  }

  Future<ui.Image?> _captureCard(int index) async {
    final boundary = _cardKeys[index].currentContext?.findRenderObject()
        as RenderRepaintBoundary?;
    if (boundary == null) return null;
    return boundary.toImage(pixelRatio: 3);
  }

  Future<Uint8List?> _cardPngBytes(int index) async {
    final image = await _captureCard(index);
    if (image == null) return null;
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    return bytes?.buffer.asUint8List();
  }

  Future<void> _saveCard() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final bytes = await _cardPngBytes(_page);
      if (bytes == null) {
        _snack('Could not capture card');
        return;
      }
      await Share.shareXFiles(
        [
          XFile.fromData(
            bytes,
            mimeType: 'image/png',
            name: 'bsquare-profile-card.png',
          ),
        ],
        text: 'My BSquare profile · $_displayName',
      );
    } catch (_) {
      if (mounted) _snack('Could not save card');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _shareText({String? prefix}) async {
    final text = [
      if (prefix != null) prefix,
      '$_displayName on BSquare',
      if (_company.isNotEmpty) _company,
      _profileLink,
    ].join('\n');
    await Share.share(text, subject: 'BSquare profile');
  }

  @override
  Widget build(BuildContext context) {
    final viewsLabel = _formatViews(widget.stats.profileViews);
    final range = _dateRangeLabel();

    return Scaffold(
      backgroundColor: const Color(0xFF050A18),
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
                  child: Row(
                    children: [
                      Material(
                        color: const Color(0xFF141B33),
                        borderRadius: BorderRadius.circular(12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () => Navigator.of(context).pop(),
                          child: const SizedBox(
                            width: 40,
                            height: 40,
                            child: Icon(
                              Icons.chevron_left_rounded,
                              color: AppColors.white,
                              size: 28,
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              'Share profile',
                              style: AppTheme.manrope(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Share this card with your network.',
                              style: AppTheme.manrope(
                                fontSize: 12,
                                color: AppColors.lightMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 40),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 360,
                  child: PageView(
                    controller: _pageController,
                    onPageChanged: (i) => setState(() => _page = i),
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _ShareCard(
                          boundaryKey: _cardKeys[0],
                          variant: _ShareCardVariant.views,
                          viewsLabel: viewsLabel,
                          dateRange: range,
                          displayName: _displayName,
                          company: _company,
                          photo: _photo,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _ShareCard(
                          boundaryKey: _cardKeys[1],
                          variant: _ShareCardVariant.identity,
                          viewsLabel: viewsLabel,
                          dateRange: range,
                          displayName: _displayName,
                          company: _company,
                          photo: _photo,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _ShareCard(
                          boundaryKey: _cardKeys[2],
                          variant: _ShareCardVariant.company,
                          viewsLabel: viewsLabel,
                          dateRange: range,
                          displayName: _displayName,
                          company: _company,
                          photo: _photo,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (i) {
                    final active = i == _page;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: active ? 8 : 7,
                      height: active ? 8 : 7,
                      decoration: BoxDecoration(
                        color: active
                            ? AppColors.purple
                            : AppColors.white.withValues(alpha: 0.25),
                        shape: BoxShape.circle,
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 28),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _ShareAction(
                        label: 'Copy link',
                        color: AppColors.accent,
                        icon: Icons.link_rounded,
                        onTap: _copyLink,
                      ),
                      _ShareAction(
                        label: 'Save',
                        color: AppColors.purple,
                        icon: Icons.download_rounded,
                        onTap: _busy ? null : _saveCard,
                      ),
                      _ShareAction(
                        label: 'WhatsApp',
                        color: const Color(0xFF25D366),
                        icon: Icons.chat_rounded,
                        onTap: () => _shareText(
                          prefix: 'Hey — check my BSquare profile:',
                        ),
                      ),
                      _ShareAction(
                        label: 'Instagram',
                        color: const Color(0xFFE1306C),
                        icon: Icons.camera_alt_rounded,
                        onTap: () => _shareText(),
                      ),
                      _ShareAction(
                        label: 'More',
                        color: AppColors.purple,
                        icon: Icons.more_horiz_rounded,
                        onTap: () => _shareText(),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF141B33),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      border: Border.all(
                        color: AppColors.border.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.lock_outline_rounded,
                          size: 16,
                          color: AppColors.purple,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Anyone with this card can view your public profile.',
                            style: AppTheme.manrope(
                              fontSize: 12,
                              color: AppColors.mutedText,
                            ),
                          ),
                        ),
                      ],
                    ),
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

enum _ShareCardVariant { views, identity, company }

class _ShareCard extends StatelessWidget {
  const _ShareCard({
    required this.boundaryKey,
    required this.variant,
    required this.viewsLabel,
    required this.dateRange,
    required this.displayName,
    required this.company,
    required this.photo,
  });

  final GlobalKey boundaryKey;
  final _ShareCardVariant variant;
  final String viewsLabel;
  final String dateRange;
  final String displayName;
  final String company;
  final ImageProvider? photo;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      key: boundaryKey,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF13204A),
              Color(0xFF0B1430),
              Color(0xFF1A1440),
            ],
          ),
          border: Border.all(
            color: AppColors.purple.withValues(alpha: 0.55),
            width: 1.4,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.purple.withValues(alpha: 0.22),
              blurRadius: 28,
              spreadRadius: 1,
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            Positioned(
              right: -36,
              top: 28,
              bottom: 28,
              child: AspectRatio(
                aspectRatio: 1,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFF6E8CFF),
                      width: 3,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6E8CFF).withValues(alpha: 0.35),
                        blurRadius: 18,
                      ),
                    ],
                  ),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      ClipOval(
                        child: photo != null
                            ? Image(
                                image: photo!,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: double.infinity,
                              )
                            : Container(
                                color: AppColors.secondary,
                                alignment: Alignment.center,
                                child: Text(
                                  displayName.isNotEmpty
                                      ? displayName[0].toUpperCase()
                                      : '?',
                                  style: AppTheme.manrope(
                                    fontSize: 64,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.white,
                                  ),
                                ),
                              ),
                      ),
                      Positioned(
                        right: 18,
                        bottom: 22,
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF0B1430),
                              width: 3,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 20, 22, 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/images/logo.png',
                        height: 36,
                        fit: BoxFit.contain,
                      ),
                    ],
                  ),
                  const Spacer(),
                  if (variant == _ShareCardVariant.views) ...[
                    Text(
                      'VIEWS',
                      style: AppTheme.manrope(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.4,
                        color: AppColors.lightMuted,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      viewsLabel,
                      style: AppTheme.manrope(
                        fontSize: 72,
                        height: 0.95,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -2,
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      width: 36,
                      height: 3,
                      decoration: BoxDecoration(
                        color: AppColors.purple,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '30 DAYS',
                      style: AppTheme.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: AppColors.accent,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      dateRange,
                      style: AppTheme.manrope(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0.6,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ] else if (variant == _ShareCardVariant.identity) ...[
                    Text(
                      displayName.toUpperCase(),
                      style: AppTheme.manrope(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        height: 1.1,
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (company.isNotEmpty)
                      Text(
                        company,
                        style: AppTheme.manrope(
                          fontSize: 15,
                          color: AppColors.mutedText,
                        ),
                      ),
                    const SizedBox(height: 16),
                    Text(
                      '$viewsLabel VIEWS',
                      style: AppTheme.manrope(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accent,
                      ),
                    ),
                  ] else ...[
                    Text(
                      company.isNotEmpty ? company.toUpperCase() : 'BSQUARE',
                      style: AppTheme.manrope(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        height: 1.1,
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      displayName,
                      style: AppTheme.manrope(
                        fontSize: 15,
                        color: AppColors.mutedText,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'MEMBER CARD',
                      style: AppTheme.manrope(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                        color: AppColors.purple,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShareAction extends StatelessWidget {
  const _ShareAction({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: const Color(0xFF141B33),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.border.withValues(alpha: 0.45),
                ),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AppTheme.manrope(
                fontSize: 11,
                color: AppColors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
