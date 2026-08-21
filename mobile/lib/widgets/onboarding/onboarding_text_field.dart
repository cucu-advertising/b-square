import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';

class OnboardingTextField extends StatelessWidget {
  const OnboardingTextField({
    super.key,
    this.label,
    required this.controller,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.maxLines = 1,
    this.inputFormatters,
    this.onChanged,
    this.autofocus = false,
  });

  final String? label;
  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final int maxLines;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: AppTheme.manrope(
              fontSize: 13,
              color: AppColors.lightMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: BackdropFilter(
            filter: ImageFilter.blur(
              sigmaX: AppColors.glassBlur,
              sigmaY: AppColors.glassBlur,
            ),
            child: TextField(
              controller: controller,
              keyboardType: keyboardType,
              obscureText: obscureText,
              maxLines: maxLines,
              autofocus: autofocus,
              inputFormatters: inputFormatters,
              onChanged: onChanged,
              style: AppTheme.manrope(
                fontSize: 17,
                fontWeight: FontWeight.w500,
                color: AppColors.white,
              ),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: AppTheme.manrope(
                  color: AppColors.lightMuted,
                  fontWeight: FontWeight.w400,
                ),
                filled: true,
                fillColor: AppColors.glassFill,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 18,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  borderSide: const BorderSide(color: AppColors.glassBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  borderSide: const BorderSide(color: AppColors.glassBorder),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  borderSide:
                      const BorderSide(color: AppColors.purple, width: 1.5),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
