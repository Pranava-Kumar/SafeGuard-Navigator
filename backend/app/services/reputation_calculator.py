import math
from typing import Tuple


class ReputationCalculator:
    """
    Calculate user reputation using the Wilson Score Confidence Interval.
    
    This is used to filter noisy/malicious reports and build a trustworthy community network.
    """
    
    def calculate_wilson_score(self, positive: int, total: int, z: float = 1.96) -> float:
        """
        Calculate the Wilson Score Confidence Interval.
        
        Args:
            positive: Number of positive reports/verifications
            total: Total number of reports/interactions
            z: Z-score for confidence level (1.96 for 95% confidence)
            
        Returns:
            Wilson score as a float between 0 and 1
        """
        if total == 0:
            return 0.0
        
        p = positive / total
        denominator = 1 + z * z / total
        centre = p + z * z / (2 * total)
        adjustment = z * math.sqrt((p * (1 - p) + z * z / (4 * total)) / total)
        
        return (centre - adjustment) / denominator
    
    def update_reputation_score(self, current_positive: int, current_total: int, 
                              new_report_verified: bool) -> Tuple[float, int, int]:
        """
        Update a user's reputation score based on a new report verification.
        
        Args:
            current_positive: Current number of verified positive reports
            current_total: Current total number of reports
            new_report_verified: Whether the new report was verified as accurate
            
        Returns:
            Tuple of (new_wilson_score, new_positive_count, new_total_count)
        """
        new_total = current_total + 1
        new_positive = current_positive + (1 if new_report_verified else 0)
        new_score = self.calculate_wilson_score(new_positive, new_total)
        
        return new_score, new_positive, new_total