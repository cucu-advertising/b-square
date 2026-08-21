import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import 'otp_screen.dart';
class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  late final TextEditingController _phoneController;
  final _authService = AuthService();
  String? _error;

  @override
  void initState() {
    super.initState();
    final provider = context.read<SignupFlowProvider>();
    _phoneController = TextEditingController(text: provider.data.phone);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  bool get _isValid => RegExp(r'^[6-9]\d{9}$').hasMatch(_phoneController.text);

  Future<void> _continue() async {
    if (!_isValid) {
      setState(() => _error = 'Enter a valid 10-digit Indian mobile number');
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    setState(() => _error = null);

    try {
      await provider.runAsync(
        () => _authService.sendOtp(_phoneController.text.trim()),
      );
      provider.update(() => provider.data.phone = _phoneController.text.trim());
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => const OtpScreen()),
      );
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: "What's your phone number?",
      progress: 0.12,
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      nextEnabled: _isValid,
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'By continuing, you consent to receive SMS and WhatsApp messages from B Square for verification and service-related purposes.',
            style: TextStyle(
              fontSize: 13,
              height: 1.45,
              color: AppColors.mutedText.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 16),
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
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _error!,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ],
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 108,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 18),
            decoration: BoxDecoration(
              color: AppColors.glassFill,
              borderRadius: BorderRadius.circular(AppRadius.sm),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('🇮🇳', style: TextStyle(fontSize: 18)),
                const SizedBox(width: 6),
                Text(
                  '+91',
                  style: AppTheme.manrope(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: OnboardingTextField(
              controller: _phoneController,
              hint: 'Phone number',
              keyboardType: TextInputType.phone,
              autofocus: true,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              onChanged: (_) => setState(() => _error = null),
            ),
          ),
        ],
      ),
    );
  }
}
