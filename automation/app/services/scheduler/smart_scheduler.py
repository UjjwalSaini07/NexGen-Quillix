import numpy as np

class SmartScheduler:

    def calculate_best_hour(self, analytics):
        hour_scores = {}

        for data in analytics:
            hour = data["posted_at"].hour
            score = data["likes"] + data["comments"]
            hour_scores.setdefault(hour, []).append(score)

        avg_scores = {
            h: np.mean(v) for h, v in hour_scores.items()
        }

        return max(avg_scores, key=avg_scores.get)