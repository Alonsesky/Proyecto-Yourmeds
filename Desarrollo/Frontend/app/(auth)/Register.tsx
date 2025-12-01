import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';

import { Ionicons } from '@expo/vector-icons';

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { register } from '../services/auth';

/* ===== Tipos expuestos al padre ===== */
export type RegisterSheetRef = { open: () => void; close: () => void };

/* ===== Helpers RUT ===== */
const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');
const formatRut = (digits: string) => {
  // espera 8–9 dígitos. formatea como 00.000.000-0
  const d = onlyDigits(digits).slice(0, 9);
  if (d.length <= 1) return d;
  const cuerpo = d.slice(0, -1);
  const dv = d.slice(-1);
  const cuerpoFmt = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFmt}-${dv}`;
};

/* ===== Formulario ===== */
type RegisterForm = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  rut: string; // lo guardamos como dígitos en el submit
  age: number;
};

/* ===== Validación ===== */
const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nombre muy corto')
    .required('El nombre es obligatorio'),
  lastName: yup
    .string()
    .min(2, 'Apellido muy corto')
    .required('El apellido es obligatorio'),
  email: yup
    .string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  password: yup
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe incluir una mayúscula')
    .matches(/[0-9]/, 'Debe incluir un número')
    .matches(/[!@#?]/, 'Debe incluir un carácter especial (! @ # ?)')
    .required('La contraseña es obligatoria'),
  confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  rut: yup
    .string()
    .transform((v) => onlyDigits(v))
    .matches(/^\d{8,9}$/, 'RUT inválido')
    .required('El RUT es obligatorio'),
  age: yup
    .number()
    .typeError('Ingresa una edad válida')
    .integer('Debe ser un número entero')
    .min(16, 'Edad mínima 16')
    .max(99, 'Edad máxima 99')
    .required('La edad es obligatoria'),
});

/* ===== Fuerza de contraseña (visual) ===== */
function calcStrength(pwd: string) {
  let score = 0;
  if (!pwd) return { score, label: 'Muy débil', color: '#FF6B6B' };
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  const labels = [
    'Muy débil',
    'Débil',
    'Aceptable',
    'Media',
    'Fuerte',
    'Muy fuerte',
  ];
  const colors = [
    '#FF6B6B',
    '#FF8A65',
    '#FFC857',
    '#F7B801',
    '#9AE6B4',
    '#2ECC71',
  ];
  const idx = Math.min(score, 5);
  return { score, label: labels[idx], color: colors[idx] };
}

type Props = { onRegistered?: () => void };

const RegisterSheet = forwardRef<RegisterSheetRef, Props>(
  ({ onRegistered }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['15%', '95%'], []);
    const [loadingReg, setLoadingReg] = useState(false);
    const [showPwdHelp, setShowPwdHelp] = useState(false); // ← popover

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.snapToIndex(1),
      close: () => sheetRef.current?.close(),
    }));

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      watch,
      setError,
    } = useForm<RegisterForm>({
      resolver: yupResolver(registerSchema),
      mode: 'onChange',
      defaultValues: { age: undefined as unknown as number }, // permite campo vacío inicialmente
    });

    const pwd = watch('password') || '';
    const strength = useMemo(() => calcStrength(pwd), [pwd]);

    const onRegister = async ({
      name,
      lastName,
      email,
      password,
      rut,
      age,
    }: RegisterForm) => {
      try {
        setLoadingReg(true);

        // Enviar exactamente lo que tu backend espera en /api/v1/auth/register
        await register({
          name,
          lastName,
          email,
          password,
          rut: onlyDigits(rut), // solo dígitos
          age: Number(age),
        });

        Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión.');
        sheetRef.current?.close();
        onRegistered?.();
      } catch (e: any) {
        const status = e?.status;
        if (status === 409) {
          setError('email', {
            type: 'server',
            message: 'Este correo ya está registrado',
          });
          return;
        }
        Alert.alert('Registro fallido', e?.message || 'No se pudo registrar');
      } finally {
        setLoadingReg(false);
      }
    };

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#0693E9', borderRadius: 26 }}
        handleIndicatorStyle={{ backgroundColor: 'transparent' }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <SheetHeader>
            <SheetTitle>REGISTRO</SheetTitle>
            <Close onPress={() => sheetRef.current?.close()}>
              <CloseText>✕</CloseText>
            </Close>
          </SheetHeader>

          {/* Nombre */}
          <LabelLight>Nombre</LabelLight>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="Ingrese Nombre"
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{
                  borderBottomColor: errors.name
                    ? '#FFD1D1'
                    : 'rgba(255,255,255,0.7)',
                }}
              />
            )}
          />
          {errors.name && <ErrorMsgLight>{errors.name.message}</ErrorMsgLight>}

          {/* Apellido */}
          <LabelLight>Apellido</LabelLight>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="Ingrese Apellido"
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{
                  borderBottomColor: errors.lastName
                    ? '#FFD1D1'
                    : 'rgba(255,255,255,0.7)',
                }}
              />
            )}
          />
          {errors.lastName && (
            <ErrorMsgLight>{errors.lastName.message}</ErrorMsgLight>
          )}

          {/* Correo */}
          <LabelLight>Correo</LabelLight>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="Ingrese Correo"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{
                  borderBottomColor: errors.email
                    ? '#FFD1D1'
                    : 'rgba(255,255,255,0.7)',
                }}
              />
            )}
          />
          {errors.email && (
            <ErrorMsgLight>{errors.email.message}</ErrorMsgLight>
          )}

          {/* Contraseña + icono ayuda */}
          <PasswordHeaderRow>
            <LabelLight
              style={{ marginTop: 10, marginBottom: 6, marginRight: 8 }}
            >
              Contraseña
            </LabelLight>
            <HelpButton onPress={() => setShowPwdHelp((v) => !v)}>
              <Ionicons
                name="help-circle-outline"
                size={18}
                color="#E6F4FF"
              />
            </HelpButton>
          </PasswordHeaderRow>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <InputLight
                  placeholder="••••"
                  secureTextEntry
                  placeholderTextColor="#E6F4FF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{
                    borderBottomColor: errors.password
                      ? '#FFD1D1'
                      : 'rgba(255,255,255,0.7)',
                  }}
                />
                {errors.password && (
                  <ErrorMsgLight>{errors.password.message}</ErrorMsgLight>
                )}

                <StrengthWrap>
                  <StrengthBarBG>
                    <StrengthBarFill
                      style={{
                        width: `${Math.min(
                          (strength.score / 5) * 100,
                          100
                        )}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </StrengthBarBG>
                  <StrengthLabel>{strength.label}</StrengthLabel>
                </StrengthWrap>

                {showPwdHelp && (
                  <PwdPopover>
                    <PopoverTitle>La contraseña debe tener:</PopoverTitle>
                    <PopoverItem>• Al menos 8 caracteres</PopoverItem>
                    <PopoverItem>• Al menos 1 letra mayúscula</PopoverItem>
                    <PopoverItem>• Al menos 1 número</PopoverItem>
                    <PopoverItem>
                      • Al menos 1 carácter especial (! @ # ?)
                    </PopoverItem>
                  </PwdPopover>
                )}
              </>
            )}
          />

          {/* Confirmación */}
          <LabelLight>Confirma Contraseña</LabelLight>
          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="••••"
                secureTextEntry
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{
                  borderBottomColor: errors.confirm
                    ? '#FFD1D1'
                    : 'rgba(255,255,255,0.7)',
                }}
              />
            )}
          />
          {errors.confirm && (
            <ErrorMsgLight>{errors.confirm.message}</ErrorMsgLight>
          )}

          {/* RUT */}
          <LabelLight>RUT (Si termina en K, coloque 0)</LabelLight>
          <Controller
            control={control}
            name="rut"
            render={({ field: { onChange, onBlur, value } }) => {
              const digits = onlyDigits(value || '').slice(0, 9);
              return (
                <InputLight
                  placeholder="00.000.000-0"
                  keyboardType="number-pad"
                  placeholderTextColor="#E6F4FF"
                  value={formatRut(digits)}
                  onChangeText={(text) =>
                    onChange(onlyDigits(text).slice(0, 9))
                  }
                  onBlur={onBlur}
                  style={{
                    borderBottomColor: errors.rut
                      ? '#FFD1D1'
                      : 'rgba(255,255,255,0.7)',
                  }}
                />
              );
            }}
          />
          {errors.rut && <ErrorMsgLight>{errors.rut.message}</ErrorMsgLight>}

          {/* Edad */}
          <LabelLight>Edad</LabelLight>
          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="Ingrese su edad"
                keyboardType="number-pad"
                placeholderTextColor="#E6F4FF"
                value={
                  value !== undefined && value !== null ? String(value) : ''
                }
                onChangeText={(t) => {
                  const dig = onlyDigits(t);
                  onChange(
                    dig ? Number(dig) : ('' as unknown as number),
                  );
                }}
                onBlur={onBlur}
                style={{
                  borderBottomColor: errors.age
                    ? '#FFD1D1'
                    : 'rgba(255,255,255,0.7)',
                }}
              />
            )}
          />
          {errors.age && <ErrorMsgLight>{errors.age.message}</ErrorMsgLight>}

          {/* Botón principal */}
          <BotonLight
            onPress={handleSubmit(onRegister)}
            disabled={!isValid || loadingReg}
            style={{ opacity: isValid && !loadingReg ? 1 : 0.6 }}
          >
            {loadingReg ? (
              <ActivityIndicator />
            ) : (
              <TextoBotonDark>Registrarse</TextoBotonDark>
            )}
          </BotonLight>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default RegisterSheet;

/* ===== Estilos solo del sheet ===== */
const SheetHeader = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 6,
  marginBottom: 10,
});
const SheetTitle = styled.Text({
  color: '#FFFFFF',
  fontSize: 28,
  fontWeight: '900',
  letterSpacing: 1,
});
const Close = styled.TouchableOpacity({
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.15)',
});
const CloseText = styled.Text({
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
});

const LabelLight = styled.Text({
  color: '#E6F4FF',
  fontSize: 14,
  marginTop: 10,
  marginBottom: 6,
  fontWeight: '600',
});
const InputLight = styled.TextInput({
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.7)',
  paddingVertical: 8,
  marginBottom: 4,
  color: '#fff',
});
const BotonLight = styled.TouchableOpacity({
  backgroundColor: '#FFFFFF',
  paddingVertical: 12,
  borderRadius: 50,
  marginTop: 18,
});
const TextoBotonDark = styled.Text({
  fontSize: 18,
  color: '#0693E9',
  fontWeight: 'bold',
  textAlign: 'center',
});

const ErrorMsgLight = styled.Text({
  color: '#FFE6E6',
  marginTop: 2,
  marginBottom: 8,
  fontSize: 12,
});

const StrengthWrap = styled.View({ marginTop: 8, marginBottom: 10 });
const StrengthBarBG = styled.View({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.25)',
  overflow: 'hidden',
});
const StrengthBarFill = styled.View({ height: '100%', width: '0%' });
const StrengthLabel = styled.Text({
  color: '#E6F4FF',
  fontSize: 12,
  marginTop: 6,
  fontWeight: '600',
});

/* ===== Estilos popover contraseña ===== */
const PasswordHeaderRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const HelpButton = styled.TouchableOpacity({
  paddingHorizontal: 4,
  paddingVertical: 2,
});

const PwdPopover = styled.View({
  marginTop: 6,
  marginBottom: 6,
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: '#CDE7FF',
});

const PopoverTitle = styled.Text({
  fontSize: 12,
  fontWeight: '800',
  color: '#0077c2',
  marginBottom: 4,
});

const PopoverItem = styled.Text({
  fontSize: 12,
  color: '#333',
});
