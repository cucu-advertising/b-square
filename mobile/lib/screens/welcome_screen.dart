import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:provider/provider.dart';

import '../providers/signup_flow_provider.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_background.dart';
import '../widgets/brand_header.dart';
import '../widgets/more_options_sheet.dart';
import '../widgets/pill_button.dart';
import 'home_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final _authService = AuthService();
  bool _signingIn = false;

  static const _callbackScheme = 'com.cucuadvertising.bsquare';

  Future<void> _signInWithLinkedIn() async {
    if (_signingIn) return;
    setState(() => _signingIn = true);
    try {
      final authUrl = await _authService.linkedInAuthorizeUrl();
      final result = await FlutterWebAuth2.authenticate(
        url: authUrl,
        callbackUrlScheme: _callbackScheme,
      );
      final uri = Uri.parse(result);
      final error = uri.queryParameters['error'];
      if (error != null && error.isNotEmpty) {
        throw AuthException('LinkedIn sign-in was cancelled or denied');
      }
      final code = uri.queryParameters['code'];
      if (code == null || code.isEmpty) {
        throw AuthException('LinkedIn sign-in failed: no code returned');
      }
      final user = await _authService.linkedInSignIn(code);
      if (!mounted) return;
      context.read<SignupFlowProvider>().applyUser(user);
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
        (_) => false,
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('LinkedIn sign-in failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _signingIn = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: AppTheme.darkStatusBar,
      child: Scaffold(
        backgroundColor: AppColors.primary,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const AuthBackground(),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const Spacer(flex: 2),
                    const BrandHeader(),
                    const Spacer(flex: 3),
                    PillButton(
                      label: _signingIn
                          ? 'Signing in...'
                          : 'Sign in with LinkedIn',
                      leading: const _LinkedInIcon(),
                      onPressed: _signInWithLinkedIn,
                    ),
                    const SizedBox(height: 12),
                    PillButton(
                      label: 'More options',
                      foregroundColor: AppColors.white,
                      glass: true,
                      onPressed: () => MoreOptionsSheet.show(context),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LinkedInIcon extends StatelessWidget {
  const _LinkedInIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF0A66C2),
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Text(
        'in',
        style: TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w700,
          height: 1,
        ),
      ),
    );
  }
}
