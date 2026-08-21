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
import '../registration/verification_screen.dart';

class MoreImagesScreen extends StatefulWidget {
  const MoreImagesScreen({super.key});

  static const maxImages = 4;

  @override
  State<MoreImagesScreen> createState() => _MoreImagesScreenState();
}

class _MoreImagesScreenState extends State<MoreImagesScreen> {
  final _picker = ImagePicker();
  final List<Uint8List> _images = [];
  final List<String> _paths = [];

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _images.addAll(data.businessGalleryBytes);
    _paths.addAll(data.businessGalleryPaths);
  }

  void _syncProvider() {
    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.businessGalleryBytes = List.from(_images);
      provider.data.businessGalleryPaths = List.from(_paths);
    });
  }

  Future<void> _addImage() async {
    if (_images.length >= MoreImagesScreen.maxImages) return;

    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );
    if (file == null) return;

    final bytes = await file.readAsBytes();
    if (!mounted) return;

    setState(() {
      _images.add(bytes);
      _paths.add(file.path);
    });
    _syncProvider();
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
      _paths.removeAt(index);
    });
    _syncProvider();
  }

  void _continue() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const VerificationScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final itemCount = _images.length +
        (_images.length < MoreImagesScreen.maxImages ? 1 : 0);

    return OnboardingScaffold(
      title: 'Add more images',
      subtitle:
          'Add photos of your product, office, team or achievements.',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.profileImage),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Showcase your business',
            style: AppTheme.manrope(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'You can add up to ${MoreImagesScreen.maxImages} photos.',
            style: AppTheme.manrope(
              fontSize: 14,
              color: AppColors.mutedText,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1,
              ),
              itemCount: itemCount,
              itemBuilder: (context, index) {
                if (index == _images.length) {
                  return _AddPhotoTile(onTap: _addImage);
                }
                return _GalleryImageTile(
                  bytes: _images[index],
                  onRemove: () => _removeImage(index),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _AddPhotoTile extends StatelessWidget {
  const _AddPhotoTile({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AppColors.glassBlur,
            sigmaY: AppColors.glassBlur,
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: AppColors.glassFill,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
              ),
              CustomPaint(
                painter: DashedBorderPainter(
                  radius: AppRadius.sm,
                  color: AppColors.glassBorder,
                ),
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add,
                    size: 32,
                    color: AppColors.purple,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add Photo',
                    style: AppTheme.manrope(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.purple,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GalleryImageTile extends StatelessWidget {
  const _GalleryImageTile({
    required this.bytes,
    required this.onRemove,
  });

  final Uint8List bytes;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.memory(bytes, fit: BoxFit.cover),
          Positioned(
            top: 8,
            right: 8,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.75),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.glassBorder),
                ),
                child: const Icon(
                  Icons.close,
                  size: 16,
                  color: AppColors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
