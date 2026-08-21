import 'dart:ui';

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PillButton extends StatelessWidget {
  const PillButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.backgroundColor = AppColors.accent,
    this.foregroundColor = AppColors.onCta,
    this.leading,
    this.borderColor,
    this.glass = false,
    this.highlight = false,
  });

  final String label;
  final VoidCallback onPressed;
  final Color backgroundColor;
  final Color foregroundColor;
  final Widget? leading;
  final Color? borderColor;
  final bool glass;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final bg = glass
        ? AppColors.glassFill
        : (highlight ? AppColors.lime : backgroundColor);
    final fg = highlight ? AppColors.primary : foregroundColor;
    final border = borderColor ?? (glass ? AppColors.glassBorder : null);
    final radius = BorderRadius.circular(AppRadius.lg);

    Widget button = SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: bg,
          foregroundColor: fg,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: radius),
          side: border != null
              ? BorderSide(color: border, width: 1)
              : BorderSide.none,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (leading != null) ...[
              leading!,
              const SizedBox(width: 10),
            ],
            Text(
              label,
              style: AppTheme.manrope(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.2,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );

    if (glass) {
      button = ClipRRect(
        borderRadius: radius,
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: AppColors.glassBlur,
            sigmaY: AppColors.glassBlur,
          ),
          child: button,
        ),
      );
    }

    return button;
  }
}
