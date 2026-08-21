import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/signup_flow_steps.dart';
import '../../providers/signup_flow_provider.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import '../auth/profile_photo_screen.dart';

class AccountCredentialsScreen extends StatefulWidget {
  const AccountCredentialsScreen({super.key});

  @override
  State<AccountCredentialsScreen> createState() =>
      _AccountCredentialsScreenState();
}

class _AccountCredentialsScreenState extends State<AccountCredentialsScreen> {
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _emailController = TextEditingController(text: data.email);
    _passwordController = TextEditingController(text: data.password);
    _confirmPasswordController =
        TextEditingController(text: data.confirmPassword);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool _validate() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmPasswordController.text;

    if (email.isEmpty || !email.contains('@')) {
      _error = 'Enter a valid email address';
      return false;
    }
    if (password.length < 8) {
      _error = 'Password must be at least 8 characters';
      return false;
    }
    if (password != confirm) {
      _error = 'Passwords do not match';
      return false;
    }
    _error = null;
    return true;
  }

  void _continue() {
    if (!_validate()) {
      setState(() {});
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.email = _emailController.text.trim();
      provider.data.password = _passwordController.text;
      provider.data.confirmPassword = _confirmPasswordController.text;
    });

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const ProfilePhotoScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: 'Create your account',
      subtitle: 'Set the email and password for your verified profile',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.account),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      child: SingleChildScrollView(
        child: Column(
          children: [
            OnboardingTextField(
              label: 'Email *',
              controller: _emailController,
              hint: 'your@business.in',
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            OnboardingTextField(
              label: 'Password *',
              controller: _passwordController,
              hint: 'Minimum 8 characters',
              obscureText: _obscurePassword,
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                child: Text(_obscurePassword ? 'SHOW' : 'HIDE'),
              ),
            ),
            const SizedBox(height: 8),
            OnboardingTextField(
              label: 'Confirm Password *',
              controller: _confirmPasswordController,
              hint: 'Re-enter password',
              obscureText: _obscureConfirm,
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                child: Text(_obscureConfirm ? 'SHOW' : 'HIDE'),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
