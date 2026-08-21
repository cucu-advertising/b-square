import 'dart:ui';

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'pill_button.dart';

class NotificationPermissionDialog extends StatelessWidget {
  const NotificationPermissionDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      barrierColor: AppColors.primary.withValues(alpha: 0.75),
      builder: (_) => const NotificationPermissionDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 28),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AppColors.glassBlur,
            sigmaY: AppColors.glassBlur,
          ),
          child: Container(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
            decoration: BoxDecoration(
              color: AppColors.glassFill,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: AppColors.glassFill,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: const Icon(
                        Icons.notifications_outlined,
                        color: AppColors.lime,
                        size: 28,
                      ),
                    ),
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Container(
                        width: 20,
                        height: 20,
                        alignment: Alignment.center,
                        decoration: const BoxDecoration(
                          color: Color(0xFFE85D5D),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '1',
                          style: AppTheme.manrope(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'Stay in the loop?',
                  textAlign: TextAlign.center,
                  style: AppTheme.manrope(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Allow notifications to get updates about new connections, messages, and opportunities.',
                  textAlign: TextAlign.center,
                  style: AppTheme.manrope(
                    fontSize: 15,
                    height: 1.45,
                    color: AppColors.mutedText,
                  ),
                ),
                const SizedBox(height: 24),
                PillButton(
                  label: 'Allow notifications',
                  onPressed: () => Navigator.of(context).pop(),
                ),
                const SizedBox(height: 10),
                PillButton(
                  label: 'Not now',
                  glass: true,
                  foregroundColor: AppColors.white,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
