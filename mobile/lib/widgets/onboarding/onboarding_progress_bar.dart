import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class OnboardingProgressBar extends StatelessWidget {
  const OnboardingProgressBar({
    super.key,
    required this.progress,
    this.segments = 1,
    this.activeSegment = 0,
  });

  final double progress;
  final int segments;
  final int activeSegment;

  @override
  Widget build(BuildContext context) {
    if (segments <= 1) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: LinearProgressIndicator(
          value: progress.clamp(0, 1),
          minHeight: 4,
          backgroundColor: AppColors.accentLight,
          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.lime),
        ),
      );
    }

    return Row(
      children: List.generate(segments, (index) {
        final isActive = index <= activeSegment;
        return Expanded(
          child: Container(
            height: 4,
            margin: EdgeInsets.only(right: index == segments - 1 ? 0 : 6),
            decoration: BoxDecoration(
              color: isActive ? AppColors.lime : AppColors.accentLight,
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
          ),
        );
      }),
    );
  }
}
