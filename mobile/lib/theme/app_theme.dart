import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Design tokens
  static const primary = Color(0xFF162A73);
  static const secondary = Color(0xFF213A89);
  static const accent = Color(0xFFD7F74A);
  static const purple = Color(0xFF8A6DFF);
  static const white = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFC8D2F0);
  static const border = Color(0xFF3E58A8);

  // Aliases used across the app
  static const black = primary;
  static const lime = accent;
  static const indigo = purple;
  static const cta = accent;
  static const onCta = primary;

  // Surfaces
  static const surfaceElevated = secondary;
  static const fieldSurface = secondary;

  // Glass / overlays
  static const glassFill = Color(0x1AFFFFFF);
  static const glassBorder = border;
  static const glassBlur = 20.0;

  // Subtle glows
  static const purpleGlow = Color(0x338A6DFF);
  static const limeGlow = Color(0x33D7F74A);
  static const navyGlow = Color(0x40213A89);

  // Text
  static const mutedText = textSecondary;
  static const lightMuted = Color(0x99C8D2F0);

  // Legacy aliases
  static const surface = primary;
  static const cream = primary;
  static const creamDark = secondary;
  static const sheetBackground = secondary;
  static const fieldFill = secondary;
  static const accentLight = Color(0x1AFFFFFF);
  static const photoPlaceholder = secondary;
  static const lightBlueAccent = border;
}

class AppRadius {
  static const sm = 16.0;
  static const md = 20.0;
  static const lg = 24.0;
  static const pill = 999.0;
}

class AppTheme {
  static ThemeData get dark {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accent,
        onPrimary: AppColors.primary,
        secondary: AppColors.purple,
        onSecondary: AppColors.white,
        surface: AppColors.primary,
        onSurface: AppColors.white,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.secondary,
        contentTextStyle: GoogleFonts.manrope(
          color: AppColors.white,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
    );

    return base.copyWith(
      textTheme: GoogleFonts.manropeTextTheme(base.textTheme).apply(
        bodyColor: AppColors.white,
        displayColor: AppColors.white,
      ),
    );
  }

  static ThemeData get light => dark;

  static const lightStatusBar = darkStatusBar;

  static const darkStatusBar = SystemUiOverlayStyle(
    statusBarBrightness: Brightness.dark,
    statusBarIconBrightness: Brightness.light,
    statusBarColor: Colors.transparent,
  );

  static TextStyle manrope({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? height,
    double? letterSpacing,
    FontStyle? fontStyle,
  }) {
    return GoogleFonts.manrope(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
      fontStyle: fontStyle,
    );
  }
}
