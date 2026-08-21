import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/brand_header.dart';
import '../../widgets/pill_button.dart';
import 'signup_profile_preview_screen.dart';

class SignupGreatStartScreen extends StatelessWidget {
  const SignupGreatStartScreen({super.key});

  String _displayName(SignupFlowProvider provider) {
    final first = provider.data.firstName.trim();
    if (first.isNotEmpty) return first;
    return provider.data.fullName.trim();
  }

  @override
  Widget build(BuildContext context) {
    final name = _displayName(context.watch<SignupFlowProvider>());

    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  const BrandLogo(height: 40),
                  const Spacer(flex: 2),
                  RichText(
                    text: TextSpan(
                      style: AppTheme.manrope(
                        fontSize: 34,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.8,
                        height: 1.15,
                        color: AppColors.white,
                      ),
                      children: [
                        const TextSpan(text: 'Off to a great start,\n'),
                        TextSpan(
                          text: '$name.',
                          style: const TextStyle(color: AppColors.purple),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Take a quick look at how you'll appear to founders, investors, and professionals",
                    style: AppTheme.manrope(
                      fontSize: 17,
                      height: 1.5,
                      color: AppColors.mutedText,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const Spacer(flex: 3),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _PageDot(active: true),
                      const SizedBox(width: 8),
                      _PageDot(active: false),
                    ],
                  ),
                  const SizedBox(height: 24),
                  PillButton(
                    label: 'Get started',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const SignupProfilePreviewScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PageDot extends StatelessWidget {
  const _PageDot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: active ? 10 : 8,
      height: active ? 10 : 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active ? AppColors.purple : AppColors.glassBorder,
      ),
    );
  }
}
