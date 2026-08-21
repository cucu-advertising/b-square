import 'dart:ui';

import 'package:flutter/material.dart';
import '../screens/auth/name_screen.dart';
import '../screens/auth/sign_in_screen.dart';
import '../theme/app_theme.dart';
import 'pill_button.dart';

class MoreOptionsSheet extends StatelessWidget {
  const MoreOptionsSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const MoreOptionsSheet(),
    );
  }

  void _startSignup(BuildContext context, Widget screen) {
    Navigator.of(context).pop();
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      child: BackdropFilter(
        filter: ImageFilter.blur(
          sigmaX: AppColors.glassBlur,
          sigmaY: AppColors.glassBlur,
        ),
        child: Container(
          decoration: const BoxDecoration(
            color: AppColors.glassFill,
            borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
            border: Border(
              top: BorderSide(color: AppColors.glassBorder),
              left: BorderSide(color: AppColors.glassBorder),
              right: BorderSide(color: AppColors.glassBorder),
            ),
            boxShadow: [
              BoxShadow(
                color: Color(0x40000000),
                blurRadius: 32,
                offset: Offset(0, -8),
              ),
            ],
          ),
          padding: EdgeInsets.fromLTRB(
            24,
            12,
            24,
            MediaQuery.paddingOf(context).bottom + 28,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: AppColors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              Text(
                'More ways to sign in',
                style: AppTheme.manrope(
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 24),
              PillButton(
                label: 'Continue with email',
                onPressed: () => _startSignup(context, const NameScreen()),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => _startSignup(context, const SignInScreen()),
                child: Text(
                  'Already have an account? Sign in',
                  style: AppTheme.manrope(
                    color: AppColors.purple,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
