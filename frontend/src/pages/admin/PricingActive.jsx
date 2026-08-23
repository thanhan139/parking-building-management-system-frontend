import { Alert, Card, Empty, Tag } from 'antd';
import {
  CATEGORY, CUSTOMER, COMBOS, ruleState,
  firstBlockText, nextBlockText, surchargeText, dayText,
} from './pricingLabels';

function Line({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: '22px' }}>
      <span style={{ color: '#8c8c8c', width: 78, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ComboCard({ combo, rule }) {
  const title = `${CATEGORY[combo.vehicleCategory]} · ${CUSTOMER[combo.customerType]}`;

  if (!rule) {
    return (
      <Card size="small" title={title} styles={{ body: { padding: 12 } }}>
        <Alert
          type="error"
          showIcon
          message="Chưa có biểu giá"
          description="Xe loại này ra cổng sẽ không tính được tiền."
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={title}
      extra={<Tag color="green">Đang chạy</Tag>}
      styles={{ body: { padding: 12 } }}
    >
      <Line label="Khối đầu" value={firstBlockText(rule)} />
      <Line label="Khối tiếp" value={nextBlockText(rule)} />
      <Line label="Phụ phí" value={surchargeText(rule)} />
      <Line label="Áp dụng từ" value={dayText(rule.effectiveFrom)} />
    </Card>
  );
}

export default function PricingActive({ rules }) {
  const running = rules.filter((rule) => ruleState(rule).key === 'RUNNING');

  const findRule = (combo) => running.find(
    (rule) => rule.vehicleCategory === combo.vehicleCategory && rule.customerType === combo.customerType,
  );

  if (!rules.length) return <Empty description="Chưa có biểu giá nào" />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
      {COMBOS.map((combo) => (
        <ComboCard
          key={`${combo.vehicleCategory}-${combo.customerType}`}
          combo={combo}
          rule={findRule(combo)}
        />
      ))}
    </div>
  );
}
