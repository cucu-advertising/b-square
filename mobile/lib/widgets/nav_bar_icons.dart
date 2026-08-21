import 'package:flutter/material.dart';

enum NavBarIconType { home, events, messages, profile }

class NavBarIcon extends StatelessWidget {
  const NavBarIcon({
    super.key,
    required this.type,
    required this.color,
    this.filled = false,
    this.size = 24,
  });

  final NavBarIconType type;
  final Color color;
  final bool filled;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _NavBarIconPainter(
          type: type,
          color: color,
          filled: filled,
        ),
      ),
    );
  }
}

class _NavBarIconPainter extends CustomPainter {
  _NavBarIconPainter({
    required this.type,
    required this.color,
    required this.filled,
  });

  final NavBarIconType type;
  final Color color;
  final bool filled;

  @override
  void paint(Canvas canvas, Size size) {
    switch (type) {
      case NavBarIconType.home:
        _paintHome(canvas, size);
      case NavBarIconType.events:
        _paintEvents(canvas, size);
      case NavBarIconType.messages:
        _paintMessages(canvas, size);
      case NavBarIconType.profile:
        _paintProfile(canvas, size);
    }
  }

  void _paintHome(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final path = Path()
      ..moveTo(w * 0.5, h * 0.18)
      ..lineTo(w * 0.14, h * 0.46)
      ..lineTo(w * 0.14, h * 0.82)
      ..lineTo(w * 0.86, h * 0.82)
      ..lineTo(w * 0.86, h * 0.46)
      ..close();

    if (filled) {
      canvas.drawPath(path, Paint()..color = color);
      return;
    }

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, paint);
  }

  void _paintEvents(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final body = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.16, h * 0.28, w * 0.68, h * 0.6),
      const Radius.circular(2.5),
    );

    final stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;

    if (filled) {
      canvas.drawRRect(body, Paint()..color = color);
      canvas.drawLine(
        Offset(w * 0.16, h * 0.44),
        Offset(w * 0.84, h * 0.44),
        Paint()
          ..color = color.withValues(alpha: 0.4)
          ..strokeWidth = 1.2,
      );
    } else {
      canvas.drawRRect(body, stroke);
      canvas.drawLine(
        Offset(w * 0.16, h * 0.44),
        Offset(w * 0.84, h * 0.44),
        stroke,
      );
    }

    final ringPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;

    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(w * 0.3, h * 0.14, w * 0.1, h * 0.18),
        const Radius.circular(1.5),
      ),
      ringPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(w * 0.6, h * 0.14, w * 0.1, h * 0.18),
        const Radius.circular(1.5),
      ),
      ringPaint,
    );
  }

  void _paintMessages(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(w * 0.12, h * 0.16, w * 0.76, h * 0.58),
          Radius.circular(w * 0.38),
        ),
      )
      ..moveTo(w * 0.34, h * 0.74)
      ..lineTo(w * 0.28, h * 0.9)
      ..lineTo(w * 0.48, h * 0.74)
      ..close();

    if (filled) {
      canvas.drawPath(path, Paint()..color = color);
      return;
    }

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, paint);
  }

  void _paintProfile(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final headCenter = Offset(w * 0.5, h * 0.34);
    final headRadius = w * 0.17;

    if (filled) {
      canvas.drawCircle(headCenter, headRadius, Paint()..color = color);
      final shoulders = Path()
        ..moveTo(w * 0.18, h * 0.72)
        ..arcToPoint(
          Offset(w * 0.82, h * 0.72),
          radius: Radius.circular(w * 0.34),
          clockwise: false,
        )
        ..close();
      canvas.drawPath(shoulders, Paint()..color = color);
      return;
    }

    final stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;
    canvas.drawCircle(headCenter, headRadius, stroke);
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(w * 0.5, h * 0.82),
        width: w * 0.62,
        height: h * 0.42,
      ),
      3.14,
      3.14,
      false,
      stroke..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant _NavBarIconPainter oldDelegate) {
    return oldDelegate.type != type ||
        oldDelegate.color != color ||
        oldDelegate.filled != filled;
  }
}
