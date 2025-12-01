import type { ApiAlarm } from '@/app/types/groupTypes';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Switch, UIManager, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  name: string;
  tint?: string;
  autoContrast?: boolean;
  alarms: ApiAlarm[];
  initiallyOpen?: boolean;
  onPressHeader?: () => void;
  onToggleAlarm?: (alarmId: number, next: boolean) => void;
  onEditAlarm?: (alarmId: number) => void;
  onDeleteAlarm?: (alarmId: number) => void;
  canEdit?: boolean;
  onLeaveGroup?: () => void;   // compartidos
  onEditGroup?: () => void;    // dueños
  /** cantidad de usuarios del grupo (dueño + miembros) */
  membersCount?: number;
};

const normalizeHex = (c?: string | null) =>
  c && /^#[0-9A-Fa-f]{6}$/.test(c.trim()) ? c.trim() : null;

const isLight = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const y = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return y > 0.7;
};

function to12h(hhmmss?: string) {
  if (!hhmmss) return '';
  const [hStr, mStr] = hhmmss.split(':');
  let h = Number(hStr);
  const m = Number(mStr);
  const am = h < 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)} ${am ? 'AM' : 'PM'}`;
}

function shortRange(d1?: string, d2?: string) {
  const fmt = (s?: string) => {
    if (!s) return '';
    const d = new Date(s + 'T00:00:00');
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = d.toLocaleString('es-CL', { month: 'short' });
    return `${dia} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
  };
  const a = fmt(d1),
    b = fmt(d2);
  return a && b ? `${a} - ${b}` : a || b || '';
}

export default function GroupCard({
  name,
  tint,
  autoContrast = true,
  alarms,
  initiallyOpen = true,
  onPressHeader,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  canEdit = true,
  onLeaveGroup,
  onEditGroup,
  membersCount,
}: Props) {
  const bg = normalizeHex(tint) ?? BLUE;
  const useDark = autoContrast && isLight(bg);
  const FG = useDark ? '#0A2540' : WHITE;
  const DIV = useDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.75)';

  const [open, setOpen] = useState(initiallyOpen);

  // usuarios vs alarmas
  const users = typeof membersCount === 'number' ? membersCount : 0;
  const alarmsCount = alarms?.length ?? 0;
  const statusText = alarmsCount
    ? `${alarmsCount} alarma${alarmsCount > 1 ? 's' : ''}`
    : 'No hay alarmas';

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
    onPressHeader?.();
  };

  // acción de header (solo una)
  const hasLeave = !!onLeaveGroup;
  const hasEditGroup = !!onEditGroup;
  const headerAction = hasLeave ? onLeaveGroup : hasEditGroup ? onEditGroup : undefined;
  const headerIconName = hasLeave ? 'exit-outline' : hasEditGroup ? 'create-outline' : undefined;

  return (
    <Wrapper $bg={bg} activeOpacity={0.9}>
      {/* CINTA SUPERIOR */}
      <RibbonWrap>
        <RibbonSVG width={300} height={40} viewBox="0 0 300 35">
          <Path
            d="M 0 10 Q 8 0 18 -5 H 140 Q 156 0 168 16 L 154 28 H 22 Q 8 28 0 16 Z"
            fill={tint}
            opacity={100}
          />
          <RibbonText style={{ color: FG, paddingLeft: 20, paddingBlock: 3 }} numberOfLines={1}>
            {name?.toUpperCase()}
          </RibbonText>
        </RibbonSVG>
      </RibbonWrap>

      {/* HEADER */}
      <Header>
        <Left>
          <Ionicons name="person-outline" size={22} color={FG} />
          <CountText style={{ color: FG }}> {users}</CountText>
        </Left>

        <Middle>
          <Ionicons name="medkit-outline" size={16} color={DIV} />
          <StatusText style={{ color: FG, marginLeft: 8 }}>{statusText}</StatusText>
        </Middle>

        <HeaderRight>
          {headerAction && headerIconName && (
            <>
              <HeaderIconBtn onPress={headerAction} hitSlop={8}>
                <Ionicons name={headerIconName} size={22} color={FG} />
              </HeaderIconBtn>

              {/* la línea usa el mismo color FG con algo de transparencia */}
              <HeaderDivider style={{ backgroundColor: FG, opacity: 0.55 }} />
            </>
          )}

          <Pressable onPress={toggleOpen} hitSlop={10} accessibilityLabel="Abrir/cerrar grupo">
            <Ionicons
              name="chevron-down"
              size={26}
              color={FG}
              style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
            />
          </Pressable>
        </HeaderRight>
      </Header>

      {/* CONTENIDO: lista de alarmas */}
      {open && (
        <View style={{ marginTop: 6 }}>
          {alarmsCount === 0 ? (
            <EmptyText style={{ color: FG, opacity: 0.9 }}>Sin alarmas</EmptyText>
          ) : (
            alarms.map((a) => {
              const time = to12h(a.time_alarm);
              let range = '';
              let freq = '';

              if (a.alarm_type === false) {
                freq = 'CADA DÍA';
                range = 'Todos los días';
              } else {
                range = shortRange(a.date_start, a.date_end);
                freq = a.interval_hours ? `CADA ${a.interval_hours} H` : 'CADA DÍA';
              }

              return (
                <AlarmRow key={a.id}>
                  <AlarmLeft>
                    <Ionicons name="medkit-outline" size={16} color={FG} />
                    <NameTime>
                      <AlarmName style={{ color: FG }}>{a.name}</AlarmName>
                      <AlarmTime style={{ color: FG }}>{time}</AlarmTime>
                    </NameTime>
                  </AlarmLeft>

                  <AlarmDivider />

                  <AlarmRight>
                    <RightCol>
                      <RangeText style={{ color: FG }}>{range}</RangeText>
                      <FreqText style={{ color: FG }}>{freq}</FreqText>
                    </RightCol>

                    <RightCol style={{ marginLeft: 1 }}>
                      <Switch
                        value={!!a.active}
                        disabled={!canEdit}
                        onValueChange={(next) => {
                          if (!canEdit) return;
                          onToggleAlarm?.(a.id, next);
                        }}
                        trackColor={{ true: 'rgba(255,255,255,0.6)' }}
                        thumbColor={WHITE}
                      />

                      {canEdit && (
                        <RowActions>
                          <IconBtn onPress={() => onDeleteAlarm?.(a.id)}>
                            <Ionicons name="trash-outline" size={18} color={FG} />
                          </IconBtn>
                          <IconBtn onPress={() => onEditAlarm?.(a.id)}>
                            <Ionicons name="create-outline" size={18} color={FG} />
                          </IconBtn>
                        </RowActions>
                      )}
                    </RightCol>
                  </AlarmRight>
                </AlarmRow>
              );
            })
          )}
        </View>
      )}
    </Wrapper>
  );
}

/* ===== estilos ===== */

const Wrapper = styled.TouchableOpacity<{ $bg: string }>(
  {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    overflow: 'visible',
  },
  (p) => ({ backgroundColor: p.$bg })
);

const RibbonWrap = styled.View({
  position: 'absolute',
  top: -12,
  left: 10,
  height: 28,
  flexDirection: 'row',
  alignItems: 'center',
});
const RibbonSVG = styled(Svg)({});
const RibbonText = styled.Text({
  marginLeft: 10,
  fontWeight: '800',
  color: '#1B70B3',
  fontSize: 12,
  letterSpacing: 0.5,
  maxWidth: 140,
});

const Header = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  minHeight: 42,
});

const Left = styled.View({ flexDirection: 'row', alignItems: 'center' });
const CountText = styled.Text({ fontSize: 18, fontWeight: '700' });
const Middle = styled.View({ flex: 1, flexDirection: 'row', alignItems: 'center' });
const StatusText = styled.Text({ fontSize: 14, fontWeight: '700' });

const HeaderRight = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  height: 26,
});

const HeaderDivider = styled.View({
  width: 1,
  height: 20,
  alignSelf: 'center',
  marginHorizontal: 8,
});

const HeaderIconBtn = styled.TouchableOpacity({
  paddingHorizontal: 2,
});

const EmptyText = styled.Text({ fontSize: 13, fontStyle: 'italic' });

const AlarmRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginTop: 8,
});

const AlarmLeft = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 80,
});

const NameTime = styled.View({
  marginLeft: 8,
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const AlarmName = styled.Text({
  fontSize: 13,
  fontWeight: '600',
  marginBottom: 2,
});

const AlarmDivider = styled.View({
  width: 1,
  height: 28,
  backgroundColor: 'rgba(255,255,255,0.35)',
  marginHorizontal: 10,
});

const AlarmTime = styled.Text({
  fontSize: 16,
  fontWeight: '700',
  textAlign: 'left',
});

const AlarmRight = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
});
const RightCol = styled.View({});

const RangeText = styled.Text({
  fontSize: 11,
  fontWeight: '700',
  opacity: 0.9,
});

const FreqText = styled.Text({
  fontSize: 15,
  fontWeight: '900',
});

const RowActions = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const IconBtn = styled.TouchableOpacity({
  padding: 6,
  marginTop: 6,
  alignSelf: 'flex-end',
});
