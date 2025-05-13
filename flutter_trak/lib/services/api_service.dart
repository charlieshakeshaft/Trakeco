import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../models/commute.dart';
import '../models/challenge.dart';
import '../models/reward.dart';

class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
  });
}

class ApiService {
  final String baseUrl;
  final http.Client _httpClient;

  ApiService({
    required this.baseUrl,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  // Auth methods
  Future<ApiResponse<User>> login(String username, String password) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final user = User.fromJson(jsonDecode(response.body));
        return ApiResponse(success: true, data: user);
      } else {
        return ApiResponse(
          success: false,
          error: 'Invalid credentials',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<bool>> register({
    required String username,
    required String email,
    required String password,
    required String name,
    String? companyName,
    String? companyDomain,
  }) async {
    try {
      // If registering with company, create company first
      int? companyId;
      if (companyName != null && companyDomain != null) {
        final companyResponse = await _httpClient.post(
          Uri.parse('$baseUrl/api/companies'),
          headers: _headers,
          body: jsonEncode({
            'name': companyName,
            'domain': companyDomain,
          }),
        );

        if (companyResponse.statusCode == 201) {
          final companyData = jsonDecode(companyResponse.body);
          companyId = companyData['id'];
        } else {
          return ApiResponse(
            success: false,
            error: 'Failed to create company',
          );
        }
      }

      // Register user
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: _headers,
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
          'name': name,
          if (companyId != null) 'company_id': companyId,
          if (companyId != null) 'role': 'admin',
        }),
      );

      if (response.statusCode == 201) {
        return ApiResponse(success: true, data: true);
      } else {
        return ApiResponse(
          success: false,
          error: 'Registration failed',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<bool>> logout() async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/auth/logout'),
        headers: _headers,
      );

      return ApiResponse(success: response.statusCode == 200, data: true);
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  // User methods
  Future<ApiResponse<User>> getUserProfile() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/user/profile'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final user = User.fromJson(jsonDecode(response.body));
        return ApiResponse(success: true, data: user);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get user profile',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  // Commute methods
  Future<ApiResponse<List<CommuteLog>>> getCommuteLogs() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/commutes'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final logs = data.map((json) => CommuteLog.fromJson(json)).toList();
        return ApiResponse(success: true, data: logs);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get commute logs',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<List<CommuteLog>>> getCurrentWeekCommuteLogs() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/commutes/current'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final logs = data.map((json) => CommuteLog.fromJson(json)).toList();
        return ApiResponse(success: true, data: logs);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get current week commute logs',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<CommuteLog>> logCommute({
    required String commuteType,
    required int daysLogged,
    required double distanceKm,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/commutes'),
        headers: _headers,
        body: jsonEncode({
          'commute_type': commuteType,
          'days_logged': daysLogged,
          'distance_km': distanceKm,
        }),
      );

      if (response.statusCode == 201) {
        final commuteLog = CommuteLog.fromJson(jsonDecode(response.body));
        return ApiResponse(success: true, data: commuteLog);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to log commute',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  // Challenge methods
  Future<ApiResponse<List<Challenge>>> getChallenges() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/challenges'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final challenges = data.map((json) => Challenge.fromJson(json)).toList();
        return ApiResponse(success: true, data: challenges);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get challenges',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<List<UserChallenge>>> getUserChallenges() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/user/challenges'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final challenges = data.map((json) => UserChallenge.fromJson(json)).toList();
        return ApiResponse(success: true, data: challenges);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get user challenges',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<ChallengeParticipant>> joinChallenge(int challengeId) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/challenges/$challengeId/join'),
        headers: _headers,
      );

      if (response.statusCode == 201) {
        final participant = ChallengeParticipant.fromJson(jsonDecode(response.body));
        return ApiResponse(success: true, data: participant);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to join challenge',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  // Reward methods
  Future<ApiResponse<List<Reward>>> getRewards() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/rewards'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final rewards = data.map((json) => Reward.fromJson(json)).toList();
        return ApiResponse(success: true, data: rewards);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get rewards',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<List<UserRedemption>>> getUserRedemptions() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/user/redemptions'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final redemptions = data.map((json) => UserRedemption.fromJson(json)).toList();
        return ApiResponse(success: true, data: redemptions);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get user redemptions',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<Redemption>> redeemReward(int rewardId) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/api/rewards/$rewardId/redeem'),
        headers: _headers,
      );

      if (response.statusCode == 201) {
        final redemption = Redemption.fromJson(jsonDecode(response.body));
        return ApiResponse(success: true, data: redemption);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to redeem reward',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  // Leaderboard method
  Future<ApiResponse<List<User>>> getLeaderboard({int limit = 10}) async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/leaderboard?limit=$limit'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final users = data.map((json) => User.fromJson(json)).toList();
        return ApiResponse(success: true, data: users);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get leaderboard',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }

  Future<ApiResponse<Map<String, dynamic>>> getUserStats() async {
    try {
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/api/user/stats'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return ApiResponse(success: true, data: data);
      } else {
        return ApiResponse(
          success: false,
          error: 'Failed to get user stats',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Network error: ${e.toString()}',
      );
    }
  }
}