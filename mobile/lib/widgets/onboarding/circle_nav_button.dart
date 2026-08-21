import 'dart:ui';

import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class CircleNavButton extends StatelessWidget {
  const CircleNavButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.backgroundColor = AppColors.accent,
    this.foregroundColor = AppColors.onCta,
    this.enabled = true,
    this.glass = false,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final Color backgroundColor;
  final Color foregroundColor;
  final bool enabled;
  final bool glass;

  @override
  Widget build(BuildContext context) {
    final bg = !enabled
        ? AppColors.glassFill
        : (glass ? AppColors.glassFill : backgroundColor);

    Widget button = Material(
      color: bg,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: enabled ? onPressed : null,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 56,
          height: 56,
          child: Icon(
            icon,
            color: enabled ? foregroundColor : AppColors.lightMuted,
            size: 22,
          ),
        ),
      ),
    );

    if (glass) {
      button = ClipOval(
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AppColors.glassBlur,
            sigmaY: AppColors.glassBlur,
          ),
          child: DecoratedBox(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: button,
          ),
        ),
      );
    }

    return button;
  }
}
