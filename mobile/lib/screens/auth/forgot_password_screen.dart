import 'package:flutter/material.dart';

import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/brand_header.dart';
import '../../widgets/onboarding/circle_nav_button.dart';
import '../../widgets/pill_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  bool _submitting = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _error = 'Enter a valid email address');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await _authService.forgotPassword(email);
      if (!mounted) return;
      setState(() => _sent = true);
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'Something went wrong: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: CircleNavButton(
                      icon: Icons.arrow_back_ios_new_rounded,
                      glass: true,
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Center(child: BrandLogo(height: 40)),
                  const SizedBox(height: 28),
                  Text(
                    'Reset your password',
                    style: AppTheme.manrope(
                      fontSize: 30,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.9,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _sent
                        ? 'Check your inbox for a link to set a new password. It expires in 1 hour.'
                        : "Enter your email and we'll send you a link to reset your password.",
                    style: AppTheme.manrope(
                      fontSize: 16,
                      height: 1.4,
                      color: AppColors.mutedText,
                    ),
                  ),
                  const SizedBox(height: 36),
                  if (!_sent) ...[
                    Text(
                      'Email',
                      style: AppTheme.manrope(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.lightMuted,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      style: AppTheme.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppColors.white,
                      ),
                      cursorColor: AppColors.purple,
                      decoration: InputDecoration(
                        hintText: 'your@business.in',
                        hintStyle: AppTheme.manrope(
                          fontSize: 16,
                          color: AppColors.lightMuted,
                        ),
                        filled: true,
                        fillColor: AppColors.fieldFill,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 22,
                          vertical: 18,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(28),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(28),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(28),
                          borderSide: const BorderSide(
                            color: AppColors.purple,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: AppTheme.manrope(
                          color: const Color(0xFFE85D5D),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ],
                  const Spacer(),
                  if (!_sent)
                    PillButton(
                      label: _submitting ? 'Sending...' : 'Send reset link',
                      onPressed: _submit,
                    )
                  else
                    PillButton(
                      label: 'Back to sign in',
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
