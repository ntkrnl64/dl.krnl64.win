import React, { useState, useEffect } from 'react';
import { Text, Button } from '@fluentui/react-components';
import { useStyles } from './styles';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  const styles = useStyles();
  const [hitokoto, setHitokoto] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHitokoto = async () => {
      try {
        const response = await fetch('https://v1.hitokoto.cn/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHitokoto(data.hitokoto);
      } catch (error) {
        console.error('Failed to fetch hitokoto:', error);
        setHitokoto('');
      } finally {
        setLoading(false);
      }
    };

    fetchHitokoto();
  }, []);

  return (
    <div className={styles.container}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        flex: 1,
        gap: '20px'
      }}>
        <Text as="h2" size={700}>404</Text>
        <Text as="h3" size={500}>文件或文件夹不存在</Text>
        <Text size={400} style={{ textAlign: 'center' }}>
          抱歉，您访问的文件或文件夹找不到。
        </Text>
        
        {!loading && hitokoto && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: 'var(--colorNeutralBackground2)',
            borderRadius: '8px',
            borderLeft: '3px solid var(--colorBrandBackground1)',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            <Text style={{ fontStyle: 'italic', color: 'var(--colorNeutralForeground3)' }}>
              "{hitokoto}"
            </Text>
          </div>
        )}

        <Button
          appearance="primary"
          onClick={onNavigateHome}
          style={{ marginTop: '20px' }}
        >
          返回首页
        </Button>
      </div>

    </div>
  );
};
