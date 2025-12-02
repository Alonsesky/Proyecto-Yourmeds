// app/(app)/help.tsx
import React, { useState } from 'react';
import { FlatList, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import styled from 'styled-components/native';
import { HELP_ITEMS, HelpItem } from '../(help)/helpItems';

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: HelpItem }) => {
    const expanded = item.id === expandedId;

    return (
      <Card onPress={() => toggleItem(item.id)} activeOpacity={0.8}>
        <QuestionText>{item.question}</QuestionText>
        <SummaryText>{item.summary}</SummaryText>

        {expanded && (
          <ExpandedArea>
            {item.steps.map((step, idx) => (
              <StepBlock key={idx}>
                <StepNumber>Pasos {idx + 1}</StepNumber>
                <StepText>{step.text}</StepText>
                {step.image && (
                  <HelpImage
                    source={step.image}
                    resizeMode="contain"
                  />
                )}
              </StepBlock>
            ))}
          </ExpandedArea>
        )}
      </Card>
    );
  };

  return (
    <Container>
      <Title>Centro de ayuda</Title>
      <Subtitle>Resuelve tus dudas sobre el uso de YourMeds.</Subtitle>

      <FlatList
        data={HELP_ITEMS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  padding: 16px;
  background-color: #f5f5ff;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #2e1ebc;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 16px;
`;

const Card = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;
  elevation: 2;
`;

const QuestionText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
`;

const SummaryText = styled.Text`
  font-size: 13px;
  color: #666;
`;

const ExpandedArea = styled.View`
  margin-top: 10px;
  border-top-width: 1px;
  border-top-color: #eee;
  padding-top: 10px;
  gap: 12px;
`;

const StepBlock = styled.View``;

const StepNumber = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #2e1ebc;
  margin-bottom: 2px;
`;

const StepText = styled.Text`
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
`;

const HelpImage = styled(Image)`
  width: 100%;
  height: 400px;   
  border-radius: 16px;
  margin-top: 10px;
`;
