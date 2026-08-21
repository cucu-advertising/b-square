import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Brand navy background with soft secondary / accent lighting.
class AuthBackground extends StatelessWidget {
  const AuthBackground({super.key});

  @override
  Widget build(BuildContext context) {
    return const Stack(
      fit: StackFit.expand,
      children: [
        ColoredBox(color: AppColors.primary),
        Positioned(
          top: -140,
          right: -90,
          child: _RadialGlow(size: 360, color: AppColors.navyGlow),
        ),
        Positioned(
          bottom: -100,
          left: -70,
          child: _RadialGlow(size: 280, color: AppColors.limeGlow),
        ),
        Positioned(
          top: 180,
          left: -120,
          child: _RadialGlow(size: 240, color: AppColors.purpleGlow),
        ),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: Alignment.topCenter,
              radius: 1.3,
              colors: [
                Color(0x33213A89),
                Colors.transparent,
              ],
              stops: [0.0, 0.7],
            ),
          ),
        ),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x00000000),
                Color(0x66162A73),
              ],
              stops: [0.55, 1.0],
            ),
          ),
        ),
      ],
    );
  }
}

class _RadialGlow extends StatelessWidget {
  const _RadialGlow({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withValues(alpha: 0)],
        ),
      ),
    );
  }
}
