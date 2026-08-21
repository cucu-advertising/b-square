import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../auth_background.dart';
import '../brand_header.dart';
import 'circle_nav_button.dart';
import 'onboarding_progress_bar.dart';

class OnboardingScaffold extends StatelessWidget {
  const OnboardingScaffold({
    super.key,
    required this.title,
    this.subtitle,
    required this.child,
    this.progress = 0,
    this.progressSegments = 1,
    this.activeSegment = 0,
    this.showLogo = true,
    this.onBack,
    this.onNext,
    this.nextEnabled = true,
    this.footer,
    this.bottomNavigationBar,
  });

  final String title;
  final String? subtitle;
  final Widget child;
  final double progress;
  final int progressSegments;
  final int activeSegment;
  final bool showLogo;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final bool nextEnabled;
  final Widget? footer;
  final Widget? bottomNavigationBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      bottomNavigationBar: bottomNavigationBar,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (showLogo) ...[
                    const Center(child: BrandLogo(height: 40)),
                    const SizedBox(height: 16),
                  ],
                  OnboardingProgressBar(
                    progress: progress,
                    segments: progressSegments,
                    activeSegment: activeSegment,
                  ),
                  const SizedBox(height: 28),
                  Text(
                    title,
                    style: AppTheme.manrope(
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.8,
                      height: 1.15,
                      color: AppColors.white,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 10),
                    Text(
                      subtitle!,
                      style: AppTheme.manrope(
                        fontSize: 16,
                        height: 1.45,
                        color: AppColors.mutedText,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  Expanded(child: child),
                  if (footer != null) ...[
                    footer!,
                    const SizedBox(height: 12),
                  ],
                  Row(
                    children: [
                      if (onBack != null)
                        CircleNavButton(
                          icon: Icons.arrow_back_ios_new_rounded,
                          glass: true,
                          onPressed: onBack,
                        ),
                      const Spacer(),
                      if (onNext != null)
                        CircleNavButton(
                          icon: Icons.arrow_forward_rounded,
                          onPressed: onNext,
                          enabled: nextEnabled,
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
