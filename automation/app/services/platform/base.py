class BasePlatformService:

    def publish(self, post):
        raise NotImplementedError

    def fetch_comments(self):
        raise NotImplementedError

    def reply(self, comment_id, message):
        raise NotImplementedError