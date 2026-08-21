import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/pill_button.dart';
import '../registration/business_info_screen.dart';

class LocationPermissionScreen extends StatelessWidget {
  const LocationPermissionScreen({super.key});

  void _continue(BuildContext context, {required bool enabled}) {
    final provider = context.read<SignupFlowProvider>();
    provider.update(() => provider.data.locationEnabled = enabled);

    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(builder: (_) => const BusinessInfoScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 28),
              child: Column(
                children: [
                  const Spacer(),
                  const _LocationIndicator(),
                  const SizedBox(height: 36),
                  Text(
                    'Connect with verified businesses near you',
                    textAlign: TextAlign.center,
                    style: AppTheme.manrope(
                      fontSize: 34,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.8,
                      height: 1.15,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'B Square shows you verified professionals in your city. City-level, never precise. Just businesses, never strangers. Welcome.',
                    textAlign: TextAlign.center,
                    style: AppTheme.manrope(
                      fontSize: 16,
                      height: 1.5,
                      color: AppColors.mutedText,
                    ),
                  ),
                  const Spacer(),
                  PillButton(
                    label: 'Turn on live city',
                    highlight: true,
                    onPressed: () => _continue(context, enabled: true),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.verified_user_outlined,
                        size: 16,
                        color: AppColors.mutedText,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'You can edit who sees it anytime',
                        style: AppTheme.manrope(
                          fontSize: 13,
                          color: AppColors.mutedText,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () => _continue(context, enabled: false),
                    child: Text(
                      'Not now',
                      style: AppTheme.manrope(
                        color: AppColors.purple,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
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

class _LocationIndicator extends StatelessWidget {
  const _LocationIndicator();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      width: 200,
      child: Stack(
        alignment: Alignment.center,
        children: [
          for (final size in [200.0, 150.0, 100.0])
            Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.glassBorder,
                ),
              ),
            ),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.purple.withValues(alpha: 0.2),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.purple),
            ),
            child: const Icon(
              Icons.location_on_outlined,
              size: 28,
              color: AppColors.purple,
            ),
          ),
          Positioned(
            bottom: 44,
            child: GlassContainer(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: AppColors.lime,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Your current city',
                    style: AppTheme.manrope(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
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
