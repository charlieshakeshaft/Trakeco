import 'commute.dart';

class Challenge {
  final int id;
  final String title;
  final String description;
  final String startDate;
  final String endDate;
  final int pointsReward;
  final String goalType;
  final double goalValue;
  final String? commuteType;
  final int? companyId;
  final String createdAt;

  Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.pointsReward,
    required this.goalType,
    required this.goalValue,
    this.commuteType,
    this.companyId,
    required this.createdAt,
  });

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      startDate: json['start_date'],
      endDate: json['end_date'],
      pointsReward: json['points_reward'],
      goalType: json['goal_type'],
      goalValue: (json['goal_value'] is int) 
          ? (json['goal_value'] as int).toDouble() 
          : json['goal_value'],
      commuteType: json['commute_type'],
      companyId: json['company_id'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'start_date': startDate,
      'end_date': endDate,
      'points_reward': pointsReward,
      'goal_type': goalType,
      'goal_value': goalValue,
      'commute_type': commuteType,
      'company_id': companyId,
      'created_at': createdAt,
    };
  }
}

class ChallengeParticipant {
  final int id;
  final int challengeId;
  final int userId;
  final double progress;
  final bool completed;
  final String joinedAt;

  ChallengeParticipant({
    required this.id,
    required this.challengeId,
    required this.userId,
    required this.progress,
    required this.completed,
    required this.joinedAt,
  });

  factory ChallengeParticipant.fromJson(Map<String, dynamic> json) {
    return ChallengeParticipant(
      id: json['id'],
      challengeId: json['challenge_id'],
      userId: json['user_id'],
      progress: (json['progress'] is int) 
          ? (json['progress'] as int).toDouble() 
          : json['progress'],
      completed: json['completed'],
      joinedAt: json['joined_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'challenge_id': challengeId,
      'user_id': userId,
      'progress': progress,
      'completed': completed,
      'joined_at': joinedAt,
    };
  }
}

class UserChallenge {
  final Challenge challenge;
  final ChallengeParticipant participant;

  UserChallenge({
    required this.challenge,
    required this.participant,
  });

  factory UserChallenge.fromJson(Map<String, dynamic> json) {
    return UserChallenge(
      challenge: Challenge.fromJson(json['challenge']),
      participant: ChallengeParticipant.fromJson(json['participant']),
    );
  }
}