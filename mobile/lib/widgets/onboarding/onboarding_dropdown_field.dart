import 'dart:ui';

import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class OnboardingDropdownField extends StatelessWidget {
  const OnboardingDropdownField({
    super.key,
    required this.label,
    required this.value,
    required this.hint,
    required this.options,
    required this.onChanged,
    this.showLabel = true,
  });

  final String label;
  final String value;
  final String hint;
  final List<String> options;
  final ValueChanged<String?> onChanged;
  final bool showLabel;

  static InputDecoration decoration() {
    return InputDecoration(
      filled: true,
      fillColor: AppColors.glassFill,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
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
        borderSide: const BorderSide(color: AppColors.purple, width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showLabel && label.isNotEmpty) ...[
          Text(
            label,
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
            child: DropdownButtonFormField<String>(
              initialValue: value.isEmpty ? null : value,
              isExpanded: true,
              style: AppTheme.manrope(
                fontSize: 17,
                fontWeight: FontWeight.w500,
                color: AppColors.white,
              ),
              dropdownColor: AppColors.surfaceElevated,
              icon: const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.white,
              ),
              hint: Text(
                hint,
                style: AppTheme.manrope(
                  color: AppColors.lightMuted,
                  fontWeight: FontWeight.w400,
                ),
              ),
              items: options
                  .map(
                    (option) => DropdownMenuItem<String>(
                      value: option,
                      child: Text(
                        option,
                        style: AppTheme.manrope(
                          color: AppColors.white,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  )
                  .toList(),
              onChanged: onChanged,
              decoration: decoration(),
            ),
          ),
        ),
      ],
    );
  }
}
