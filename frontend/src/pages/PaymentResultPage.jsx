import { useEffect, useState } from 'react';
import { Result, Button, Card, Descriptions, Spin, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, HomeOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';

const { Text } = Typography;

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(null);

  const params = Object.fromEntries(searchParams.entries());
  const responseCode = params.vnp_ResponseCode;
  const isSuccess = responseCode === '00' && params.vnp_TransactionStatus === '00';
  const amount = params.vnp_Amount ? Number(params.vnp_Amount) / 100 : null;

  useEffect(() => {
    const verify = async () => {
      if (!responseCode) {
        setVerifying(false);
        return;
      }
      try {
        await paymentService.verifyPayment(params);
        setVerified(true);
      } catch (err) {
        setVerified(false);
      } finally {
        setVerifying(false);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f6f9' }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang xác thực giao dịch với hệ thống...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f6f9', padding: 24 }}>
      <Card style={{ maxWidth: 560, width: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <Result
          status={isSuccess ? 'success' : 'error'}
          icon={isSuccess ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : <CloseCircleFilled style={{ color: '#ff4d4f' }} />}
          title={isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          subTitle={
            verified === false
              ? 'Không thể xác thực giao dịch với hệ thống. Vui lòng kiểm tra lại lịch sử thanh toán.'
              : isSuccess
                ? 'Giao dịch của bạn đã được xử lý thành công qua VNPay.'
                : 'Giao dịch không hoàn tất hoặc đã bị hủy.'
          }
          extra={
            <div>
              <Descriptions
                column={1}
                size="small"
                bordered
                style={{ textAlign: 'left', marginBottom: 24 }}
                items={[
                  { key: 'txn', label: 'Mã giao dịch', children: params.vnp_TxnRef || '-' },
                  { key: 'amount', label: 'Số tiền', children: amount !== null ? `${amount.toLocaleString()} VND` : '-' },
                  { key: 'bank', label: 'Ngân hàng', children: params.vnp_BankCode || '-' },
                  { key: 'transNo', label: 'Mã VNPAY', children: params.vnp_TransactionNo || '-' },
                  {
                    key: 'date',
                    label: 'Thời gian',
                    children: params.vnp_PayDate
                      ? `${params.vnp_PayDate.slice(6, 8)}/${params.vnp_PayDate.slice(4, 6)}/${params.vnp_PayDate.slice(0, 4)} ${params.vnp_PayDate.slice(8, 10)}:${params.vnp_PayDate.slice(10, 12)}:${params.vnp_PayDate.slice(12, 14)}`
                      : '-',
                  },
                ]}
              />
              <Button type="primary" size="large" icon={<HomeOutlined />} onClick={() => navigate('/')} style={{ marginRight: 12 }}>
                Về trang chủ
              </Button>
              <Button size="large" icon={<CreditCardOutlined />} onClick={() => navigate('/subscriptions')}>
                Xem gói thuê bao
              </Button>
            </div>
          }
        />
      </Card>
    </div>
  );
}
