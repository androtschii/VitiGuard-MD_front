// Карточки моделей машинного обучения VitiGuard MD и их метрики качества
// Числа строго согласованы со спецификацией дипломного проекта

export type ModelMetric = {
  labelKey: string
  value?: string
  valueKey?: string
  hintKey?: string
}

export type ModelCardData = {
  id: string
  titleKey: string
  badge: string
  purposeKey: string
  explanationKey: string
  metrics: ModelMetric[]
  classes?: readonly string[]
}

export type ModelLimitation = {
  id: string
  textKey: string
}

export const MODEL_CARDS: readonly ModelCardData[] = [
  {
    id: 'leaf_classifier',
    titleKey: 'models.cards.leafClassifier.title',
    badge: 'EfficientNet-B0 · ONNX (224×224)',
    purposeKey: 'models.cards.leafClassifier.purpose',
    explanationKey: 'models.cards.leafClassifier.explanation',
    metrics: [
      {
        labelKey: 'models.metrics.macroF1',
        value: '0,971',
        hintKey: 'models.metrics.macroF1Hint',
      },
      {
        labelKey: 'models.metrics.labAccuracy',
        value: '97,3 %',
        hintKey: 'models.metrics.labAccuracyHint',
      },
      {
        labelKey: 'models.metrics.fieldAccuracy',
        value: '90,4 %',
        hintKey: 'models.metrics.fieldAccuracyHint',
      },
      {
        labelKey: 'models.metrics.speed',
        valueKey: 'models.metrics.speedVal',
        hintKey: 'models.metrics.speedHint',
      },
    ],
    classes: [
      'healthy',
      'black_rot',
      'esca',
      'leaf_blight',
      'downy_mildew',
      'powdery_mildew',
    ],
  },
  {
    id: 'leaf_filter',
    titleKey: 'models.cards.leafFilter.title',
    badge: 'EfficientNet-B0 + LogReg',
    purposeKey: 'models.cards.leafFilter.purpose',
    explanationKey: 'models.cards.leafFilter.explanation',
    metrics: [
      {
        labelKey: 'models.metrics.rejectedNonLeaf',
        value: '99,8 %',
        hintKey: 'models.metrics.rejectedNonLeafHint',
      },
      {
        labelKey: 'models.metrics.passedLeaf',
        value: '96–99,7 %',
        hintKey: 'models.metrics.passedLeafHint',
      },
    ],
  },
  {
    id: 'vine_detector',
    titleKey: 'models.cards.vineDetector.title',
    badge: 'YOLO11n (v002)',
    purposeKey: 'models.cards.vineDetector.purpose',
    explanationKey: 'models.cards.vineDetector.explanation',
    metrics: [
      {
        labelKey: 'models.metrics.mAP50',
        value: '0,786',
        hintKey: 'models.metrics.mAP50Hint',
      },
      {
        labelKey: 'models.metrics.mAP50_95',
        value: '0,413',
        hintKey: 'models.metrics.mAP50_95Hint',
      },
      {
        labelKey: 'models.metrics.trunkMap',
        value: '0,303',
        hintKey: 'models.metrics.trunkMapHint',
      },
      {
        labelKey: 'models.metrics.bunchMap',
        value: '0,524',
        hintKey: 'models.metrics.bunchMapHint',
      },
    ],
  },
  {
    id: 'downy_forecast',
    titleKey: 'models.cards.downyForecast.title',
    badge: 'LightGBM',
    purposeKey: 'models.cards.downyForecast.purpose',
    explanationKey: 'models.cards.downyForecast.explanation',
    metrics: [
      {
        labelKey: 'models.metrics.prAuc',
        value: '0,65',
        hintKey: 'models.metrics.prAucHint',
      },
      {
        labelKey: 'models.metrics.baselinePrAuc',
        value: '0,42',
        hintKey: 'models.metrics.baselinePrAucHint',
      },
      {
        labelKey: 'models.metrics.horizon',
        valueKey: 'models.metrics.horizonVal',
        hintKey: 'models.metrics.horizonHint',
      },
    ],
  },
]

export const MODEL_LIMITATIONS: readonly ModelLimitation[] = [
  { id: 'field_error', textKey: 'models.limitations.fieldError' },
  { id: 'small_bunches', textKey: 'models.limitations.smallBunches' },
  { id: 'decision_support', textKey: 'models.limitations.decisionSupport' },
]
