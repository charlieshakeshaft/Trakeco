import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;
  final FlutterSecureStorage _secureStorage;
  
  User? _user;
  bool _isLoading = true;
  String? _error;

  AuthProvider({
    required ApiService apiService,
    FlutterSecureStorage? secureStorage,
  })  : _apiService = apiService,
        _secureStorage = secureStorage ?? const FlutterSecureStorage() {
    _initAuth();
  }

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String? get error => _error;
  bool get isAdmin => _user?.isAdmin ?? false;

  // Initialize authentication state
  Future<void> _initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Check if we have a stored user
      final userJson = await _secureStorage.read(key: 'user');
      if (userJson != null) {
        final userData = jsonDecode(userJson);
        _user = User.fromJson(userData);
        
        // Verify that the user is still valid by fetching profile
        await _refreshUserProfile();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Refresh user profile
  Future<void> _refreshUserProfile() async {
    try {
      final response = await _apiService.getUserProfile();
      if (response.success && response.data != null) {
        _user = response.data;
        await _secureStorage.write(
          key: 'user',
          value: jsonEncode(_user!.toJson()),
        );
      } else {
        // If we can't get the profile, the user may be logged out
        _user = null;
        await _secureStorage.delete(key: 'user');
      }
    } catch (e) {
      _error = e.toString();
    }
    notifyListeners();
  }

  // Login
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(username, password);
      if (response.success && response.data != null) {
        _user = response.data;
        await _secureStorage.write(
          key: 'user',
          value: jsonEncode(_user!.toJson()),
        );
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response.error ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Register
  Future<bool> register({
    required String username,
    required String email,
    required String password,
    required String name,
    String? companyName,
    String? companyDomain,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.register(
        username: username,
        email: email,
        password: password,
        name: name,
        companyName: companyName,
        companyDomain: companyDomain,
      );

      if (response.success) {
        // After registration, log the user in
        return await login(username, password);
      } else {
        _error = response.error ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.logout();
    } catch (e) {
      // Even if the API call fails, we proceed with local logout
    }

    // Clear local storage and state
    _user = null;
    await _secureStorage.delete(key: 'user');
    
    _isLoading = false;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _error = null;
    notifyListeners();
  }
}