import * as Amplitude from '@amplitude/node';

import * as dotenv from 'dotenv';
dotenv.config()

const client = Amplitude.init(process.env.AMPLITUDE_TOKEN);

export function trackWordQuizShowed(tgId, word, type) {
  client.logEvent({
    event_type: 'Word Showed',
    user_id: `${tgId}`,
    event_properties: {
      word: word,
      type: type
    }
  });
}

export function trackWordQuizAnswered(tgId, isRight, word) {
  client.logEvent({
    event_type: 'Word Answered',
    user_id: `${tgId}`,
    event_properties: {
      word: word,
      rightAnswer: isRight
    }
  });
}

export function trackLanguageSelected(tgId, languageCode) {
  client.logEvent({
    event_type: 'Language Selected',
    user_id: `${tgId}`,
    event_properties: {
      languageCode: languageCode
    }
  });
}

export function trackUserCreated(tgId, languageCode) {
  client.logEvent({
    event_type: 'User Created',
    user_id: `${tgId}`,
    event_properties: {
      languageCode: languageCode
    }
  });
}

export function trackWordAdded(tgId, word) {
  client.logEvent({
    event_type: 'Word Added',
    user_id: `${tgId}`,
    event_properties: {
      word: word
    }
  });
}

export function trackUserStatsShowed(tgId) {
  client.logEvent({
    event_type: 'User Stats Showed',
    user_id: `${tgId}`
  });
}

export function trackTrainingEnabled(tgId) {
  client.logEvent({
    event_type: 'User Training Enabled',
    user_id: `${tgId}`
  });
}

export function trackTrainingDisabled(tgId) {
  client.logEvent({
    event_type: 'User Training Disabled',
    user_id: `${tgId}`
  });
}