import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dashed_border.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../constants/signup_flow_steps.dart';
import 'more_images_screen.dart';

class ProfilePhotoScreen extends StatefulWidget {
  const ProfilePhotoScreen({super.key});

  @override
  State<ProfilePhotoScreen> createState() => _ProfilePhotoScreenState();
}

class _ProfilePhotoScreenState extends State<ProfilePhotoScreen> {
  final _picker = ImagePicker();
  Uint8List? _profileBytes;
  Uint8List? _logoBytes;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _profileBytes = data.profilePhotoBytes;
    _logoBytes = data.companyLogoBytes;
  }

  Future<void> _pickImage({required bool isProfile}) async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );
    if (file == null) return;

    final bytes = await file.readAsBytes();
    if (!mounted) return;

    setState(() {
      if (isProfile) {
        _profileBytes = bytes;
      } else {
        _logoBytes = bytes;
      }
    });

    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      if (isProfile) {
        provider.data.profilePhotoBytes = bytes;
        provider.data.profilePhotoPath = file.path;
      } else {
        provider.data.companyLogoBytes = bytes;
        provider.data.companyLogoPath = file.path;
      }
    });
  }

  void _continue() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const MoreImagesScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: 'Add a profile image',
      subtitle: 'Add a profile photo and your business logo',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.profileImage),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      child: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 8),
            _ImageUploadSlot(
              title: 'Profile Photo',
              subtitle: _profileBytes == null
                  ? 'Add a clear photo of yourself'
                  : 'Change photo',
              size: 148,
              isCircle: true,
              bytes: _profileBytes,
              emptyIcon: Icons.person_outline_rounded,
              onTap: () => _pickImage(isProfile: true),
            ),
            const SizedBox(height: 36),
            _ImageUploadSlot(
              title: 'Business Logo',
              subtitle:
                  _logoBytes == null ? 'Add your company logo' : 'Change logo',
              size: 132,
              isCircle: false,
              dashedBorder: true,
              bytes: _logoBytes,
              emptyIcon: Icons.image_outlined,
              onTap: () => _pickImage(isProfile: false),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageUploadSlot extends StatelessWidget {
  const _ImageUploadSlot({
    required this.title,
    required this.subtitle,
    required this.size,
    required this.isCircle,
    required this.bytes,
    required this.emptyIcon,
    required this.onTap,
    this.dashedBorder = false,
  });

  final String title;
  final String subtitle;
  final double size;
  final bool isCircle;
  final bool dashedBorder;
  final Uint8List? bytes;
  final IconData emptyIcon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final borderRadius =
        isCircle ? null : BorderRadius.circular(AppRadius.md);
    final hasImage = bytes != null;

    Widget imageArea = SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          GestureDetector(
            onTap: onTap,
            child: ClipRRect(
              borderRadius: borderRadius ?? BorderRadius.circular(size / 2),
              child: BackdropFilter(
                filter: ImageFilter.blur(
                  sigmaX: AppColors.glassBlur,
                  sigmaY: AppColors.glassBlur,
                ),
                child: Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    color: AppColors.glassFill,
                    shape: isCircle ? BoxShape.circle : BoxShape.rectangle,
                    borderRadius: borderRadius,
                    border: dashedBorder
                        ? null
                        : Border.all(color: AppColors.glassBorder),
                    image: hasImage
                        ? DecorationImage(
                            image: MemoryImage(bytes!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: hasImage
                      ? null
                      : Icon(
                          emptyIcon,
                          size: isCircle ? 52 : 44,
                          color: AppColors.mutedText,
                        ),
                ),
              ),
            ),
          ),
          if (dashedBorder && !hasImage)
            Positioned.fill(
              child: CustomPaint(
                painter: DashedBorderPainter(
                  radius: AppRadius.md,
                  color: AppColors.glassBorder,
                ),
              ),
            ),
          Positioned(
            right: isCircle ? 4 : -2,
            bottom: isCircle ? 4 : -2,
            child: GestureDetector(
              onTap: onTap,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: hasImage ? AppColors.glassFill : AppColors.purple,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: hasImage ? AppColors.glassBorder : AppColors.purple,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.purple.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Icon(
                  hasImage ? Icons.edit_outlined : Icons.add,
                  size: 18,
                  color: AppColors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );

    if (dashedBorder) {
      imageArea = Padding(
        padding: const EdgeInsets.all(4),
        child: imageArea,
      );
    }

    return Column(
      children: [
        imageArea,
        const SizedBox(height: 16),
        Text(
          title,
          style: AppTheme.manrope(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: AppTheme.manrope(
            fontSize: 14,
            color: AppColors.mutedText,
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }
}

