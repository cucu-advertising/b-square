import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/brand_header.dart';
import '../../widgets/onboarding/circle_nav_button.dart';
import '../../widgets/pill_button.dart';
import '../home_screen.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _authService = AuthService();
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _error;

  static const _fieldFill = AppColors.fieldFill;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _validate() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || !email.contains('@')) {
      _error = 'Enter a valid email address';
      return false;
    }
    if (password.isEmpty) {
      _error = 'Enter your password';
      return false;
    }
    _error = null;
    return true;
  }

  Future<void> _signIn() async {
    if (!_validate()) {
      setState(() {});
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final user = await _authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      if (!mounted) return;
      context.read<SignupFlowProvider>().applyUser(user);
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
        (_) => false,
      );
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onForgotPassword() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Coming soon')),
    );
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
                    'Welcome back',
                    style: AppTheme.manrope(
                      fontSize: 34,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.9,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to your verified network',
                    style: AppTheme.manrope(
                      fontSize: 16,
                      height: 1.4,
                      color: AppColors.mutedText,
                    ),
                  ),
                  const SizedBox(height: 36),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _SignInTextField(
                            label: 'Email',
                            controller: _emailController,
                            hint: 'your@business.in',
                            keyboardType: TextInputType.emailAddress,
                            fillColor: _fieldFill,
                            autofillHints: const [AutofillHints.email],
                          ),
                          const SizedBox(height: 20),
                          _SignInTextField(
                            label: 'Password',
                            controller: _passwordController,
                            hint: 'Enter your password',
                            obscureText: _obscurePassword,
                            fillColor: _fieldFill,
                            autofillHints: const [AutofillHints.password],
                            suffix: GestureDetector(
                              onTap: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                              behavior: HitTestBehavior.opaque,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 8,
                                ),
                                child: Text(
                                  _obscurePassword ? 'SHOW' : 'HIDE',
                                  style: AppTheme.manrope(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.4,
                                    color: AppColors.purple,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: _onForgotPassword,
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 4,
                                ),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: Text(
                                'Forgot password?',
                                style: AppTheme.manrope(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.purple,
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
                      ),
                    ),
                  ),
                  PillButton(
                    label: _isLoading ? 'Signing in...' : 'Sign in',
                    onPressed: _isLoading ? () {} : _signIn,
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

class _SignInTextField extends StatelessWidget {
  const _SignInTextField({
    required this.label,
    required this.controller,
    required this.fillColor,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.suffix,
    this.autofillHints,
  });

  final String label;
  final TextEditingController controller;
  final Color fillColor;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final Widget? suffix;
  final Iterable<String>? autofillHints;

  static const _radius = 28.0;

  @override
  Widget build(BuildContext context) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(_radius),
      borderSide: BorderSide.none,
    );
    final focusedBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(_radius),
      borderSide: const BorderSide(color: AppColors.purple, width: 1.5),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTheme.manrope(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.lightMuted,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          autofillHints: autofillHints,
          style: AppTheme.manrope(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: AppColors.white,
          ),
          cursorColor: AppColors.purple,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTheme.manrope(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: AppColors.lightMuted,
            ),
            filled: true,
            fillColor: fillColor,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 22,
              vertical: 18,
            ),
            suffixIcon: suffix == null
                ? null
                : Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: suffix,
                  ),
            suffixIconConstraints: const BoxConstraints(
              minWidth: 0,
              minHeight: 0,
            ),
            border: border,
            enabledBorder: border,
            focusedBorder: focusedBorder,
          ),
        ),
      ],
    );
  }
}
