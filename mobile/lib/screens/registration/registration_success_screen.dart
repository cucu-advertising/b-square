import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/pill_button.dart';
import '../welcome_screen.dart';

class RegistrationSuccessScreen extends StatelessWidget {
  const RegistrationSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final data = context.watch<SignupFlowProvider>().data;

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Spacer(),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.lime,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.lime.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      color: AppColors.primary,
                      size: 36,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Application submitted!',
                    textAlign: TextAlign.center,
                    style: AppTheme.manrope(
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.6,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Our admin team will verify your details and approve your account within 24 hours.',
                    textAlign: TextAlign.center,
                    style: AppTheme.manrope(
                      fontSize: 16,
                      height: 1.5,
                      color: AppColors.mutedText,
                    ),
                  ),
                  const SizedBox(height: 28),
                  _InfoRow(label: 'Business', value: data.businessName),
                  _InfoRow(
                    label: 'Verification',
                    value: switch (data.verificationType.name) {
                      'din' => 'DIN',
                      'linkedin' => 'LinkedIn',
                      _ => 'Succession',
                    },
                  ),
                  const _InfoRow(label: 'Status', value: 'Pending review'),
                  const Spacer(),
                  PillButton(
                    label: 'Back to sign in',
                    onPressed: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute<void>(
                          builder: (_) => const WelcomeScreen(),
                        ),
                        (_) => false,
                      );
                    },
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Row(
        children: [
          Text(
            label,
            style: AppTheme.manrope(
              color: AppColors.mutedText,
              fontSize: 14,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: AppTheme.manrope(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.white,
            ),
          ),
        ],
      ),
    );
  }
}
