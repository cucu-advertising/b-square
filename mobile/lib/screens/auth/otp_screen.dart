import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/otp_input.dart';
import 'name_screen.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _authService = AuthService();
  String _otp = '';
  String? _error;
  int _secondsLeft = 59;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = 59);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft == 0) {
        timer.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  Future<void> _verify() async {
    if (_otp.length != 6) {
      setState(() => _error = 'Enter the 6-digit code');
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    setState(() => _error = null);

    try {
      await provider.runAsync(
        () => _authService.verifyOtp(provider.data.phone, _otp),
      );
      if (!mounted) return;
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(builder: (_) => const NameScreen()),
      );
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    }
  }

  Future<void> _resend() async {
    if (_secondsLeft > 0) return;
    final provider = context.read<SignupFlowProvider>();
    await provider.runAsync(
      () => _authService.sendOtp(provider.data.phone),
    );
    _startTimer();
  }

  @override
  Widget build(BuildContext context) {
    final phone = context.watch<SignupFlowProvider>().data.phone;
    final formattedPhone = phone.replaceRange(0, phone.length - 4, '*****');

    return OnboardingScaffold(
      title: "We just texted you, what's the code?",
      progress: 0.22,
      onBack: () => Navigator.of(context).pop(),
      onNext: _verify,
      nextEnabled: _otp.length == 6,
      footer: Column(
        children: [
          Text(
            "We've sent a WhatsApp or SMS verification code to +91 $formattedPhone",
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              height: 1.45,
              color: AppColors.mutedText,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _secondsLeft == 0 ? _resend : null,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: Text(
              _secondsLeft == 0
                  ? 'Resend code'
                  : 'Resend code in ${_secondsLeft}s...',
            ),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              backgroundColor: AppColors.fieldFill,
              foregroundColor: AppColors.black,
              side: BorderSide.none,
              shape: const StadiumBorder(),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _error!,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ],
          const SizedBox(height: 12),
          Text(
            'Experiencing issues? Email our team:',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.mutedText.withValues(alpha: 0.9),
            ),
          ),
          Text(
            AppConstants.supportEmail,
            style: const TextStyle(
              fontSize: 13,
              decoration: TextDecoration.underline,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
      child: OtpInput(
        length: 6,
        onChanged: (value) => setState(() {
          _otp = value;
          _error = null;
        }),
        onCompleted: (_) => _verify(),
      ),
    );
  }
}
