import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import styled from 'styled-components/native';
import { login, register } from '../services/auth';

// Formularios y validación
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';



// Tipos de datos de los formularios
type LoginForm = { email: string; password: string };
type RegisterForm = { name: string; email: string; password: string; confirm: string };

// Reglas de validación (Yup)
const loginSchema = yup.object({
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().min(4, 'Mínimo 4 caracteres').required('La contraseña es obligatoria'),
});

const registerSchema = yup.object({
  name: yup.string().min(2, 'Nombre muy corto').required('El nombre es obligatorio'),
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Debe incluir una mayúscula')
    .matches(/[0-9]/, 'Debe incluir un número')
    .required('La contraseña es obligatoria'),
  confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

// 🔸 Función para calcular fortaleza
function calcStrength(pwd: string) {
  let score = 0;
  if (!pwd) return { score, label: 'Muy débil', color: '#FF6B6B' };

  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Media', 'Fuerte', 'Muy fuerte'];
  const colors = ['#FF6B6B', '#FF8A65', '#FFC857', '#F7B801', '#9AE6B4', '#2ECC71'];
  const idx = Math.min(score, 5);
  return { score, label: labels[idx], color: colors[idx] };
}

export default function LoginScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '95%'], []);
  const [isOpen, setIsOpen] = useState(false);

  //loading del registro
  const [loadingReg, setLoadingReg] = useState(false);

  // Hook de formulario para Login
  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isValid: isLoginValid },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  // Hook de formulario para Registro (con watch)
  const {
    control: regControl,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors, isValid: isRegValid },
    watch: watchReg, // para fuerza
    setError,        // NEW: para marcar error de email por 409
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  // Fuerza de contraseña en registro
  const regPwd = watchReg('password') || '';
  const strength = useMemo(() => calcStrength(regPwd), [regPwd]);

  
  // Login: de momento solo log
  const [loadingLogin, setLoadingLogin] = useState(false);

  
  const onLogin =  async ({ email, password }: LoginForm) => {
    try {
      setLoadingLogin(true);;
      await login({email, password});
      // Aqui se guarda el token en storage (según services/auth)
      router.replace('../(app)/home');
    } catch (e:any) {
      Alert.alert("Error", e?.message ?? "No fue posible iniciar sesión.");
    } finally {
      setLoadingLogin(false);
    }
  }; 

  // Registro: llamando al backend

  const onRegister = async ({ name, email, password }: RegisterForm) => {
    try {
      setLoadingReg(true);
      await register({email, password });
      Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión.');
      closeRegister();
    } catch (e: any) {
      const status = e?.status;
      if (status === 409) {
        setError('email', { type: 'server', message: 'Este correo ya está registrado' });
        return;
      }
      Alert.alert('Registro fallido', e?.message || 'No se pudo registrar');
    } finally {
      setLoadingReg(false);
    }
  };

  const openRegister = useCallback(() => {
    setIsOpen(true);
    sheetRef.current?.snapToIndex(1); // abre a 95%
  }, []);

  const closeRegister = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const onSheetChange = (idx: number) => {
    if (idx === -1) setIsOpen(false);
  };

  return (
    <Contenedor behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <Header>
        <Imagen source={require('../../assets/images/Logo.png')} />
        <Titulo>YourMeds</Titulo>
      </Header>

      {/* --------- LOGIN --------- */}
      <SubTitulo>Correo</SubTitulo>
      <Controller
        control={loginControl}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Textinput
            placeholder="Ingrese correo"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={{ borderColor: loginErrors.email ? '#E53935' : '#000000' }}
          />
        )}
      />
      {loginErrors.email && <ErrorMsg>{loginErrors.email.message}</ErrorMsg>}

      <SubTitulo>Contraseña</SubTitulo>
      <Controller
        control={loginControl}
        name="password"
        render={({ field: { onChange, onBlur, value} }) => (
          <Textinput
            placeholder="Ingrese contraseña"
            secureTextEntry
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={{ borderColor: loginErrors.password ? '#E53935' : '#000000' }}
          />
        )}
      />
      {loginErrors.password && <ErrorMsg>{loginErrors.password.message}</ErrorMsg>}

      <Boton onPress={handleLoginSubmit(onLogin)} disabled={!isLoginValid} style={{ opacity: isLoginValid ? 1 : 0.6 }}>
        <TextoBoton>Ingresar</TextoBoton>
      </Boton>

      <Row>
        <Left>
          <CheckBox />
          <Texto>Recordarme</Texto>
        </Left>
        <TextoLinkSm>Contraseña Olvidada</TextoLinkSm>
      </Row>

      <TextLink>¿No tienes Cuenta?</TextLink>
      <Boton onPress={openRegister}>
        <TextoBoton>Registrarse</TextoBoton>
      </Boton>

      {/* --------- BOTTOM SHEET: REGISTRO --------- */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={onSheetChange}
        backgroundStyle={{ backgroundColor: '#0693E9', borderRadius: 26 }}
        handleIndicatorStyle={{ backgroundColor: 'transparent' }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <SheetHeader>
            <SheetTitle>REGISTRO</SheetTitle>
            <Close onPress={closeRegister}>
              <CloseText>✕</CloseText>
            </Close>
          </SheetHeader>

          <LabelLight>Nombre</LabelLight>
          <Controller
            control={regControl}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="Ingrese Nombre"
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{ borderBottomColor: regErrors.name ? '#FFD1D1' : 'rgba(255,255,255,0.7)' }}
              />
            )}
          />
          {regErrors.name && <ErrorMsgLight>{regErrors.name.message}</ErrorMsgLight>}

          <LabelLight>Correo</LabelLight>
          <Controller
            control={regControl}
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
                style={{ borderBottomColor: regErrors.email ? '#FFD1D1' : 'rgba(255,255,255,0.7)' }}
              />
            )}
          />
          {regErrors.email && <ErrorMsgLight>{regErrors.email.message}</ErrorMsgLight>}

          <LabelLight>Contraseña</LabelLight>
          <Controller
            control={regControl}
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
                  style={{ borderBottomColor: regErrors.password ? '#FFD1D1' : 'rgba(255,255,255,0.7)' }}
                />
                {regErrors.password && <ErrorMsgLight>{regErrors.password.message}</ErrorMsgLight>}

                {/* Barra de fortaleza */}
                <StrengthWrap>
                  <StrengthBarBG>
                    <StrengthBarFill
                      style={{
                        width: `${Math.min((strength.score / 5) * 100, 100)}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </StrengthBarBG>
                  <StrengthLabel>{strength.label}</StrengthLabel>
                </StrengthWrap>
              </>
            )}
          />

          <LabelLight>Confirma Contraseña</LabelLight>
          <Controller
            control={regControl}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputLight
                placeholder="••••"
                secureTextEntry
                placeholderTextColor="#E6F4FF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{ borderBottomColor: regErrors.confirm ? '#FFD1D1' : 'rgba(255,255,255,0.7)' }}
              />
            )}
          />
          {regErrors.confirm && <ErrorMsgLight>{regErrors.confirm.message}</ErrorMsgLight>}

          {/* NEW: botón con loader y deshabilitado si inválido o cargando */}
          <BotonLight
            onPress={handleRegSubmit(onRegister)}
            disabled={!isRegValid || loadingReg}
            style={{ opacity: isRegValid && !loadingReg ? 1 : 0.6 }}
          >
            {loadingReg ? <ActivityIndicator /> : <TextoBotonDark>Registrar</TextoBotonDark>}
          </BotonLight>

          <DividerWrap>
            <Divider />
            <DividerText>o</DividerText>
            <Divider />
          </DividerWrap>

          <RowCenter>
            <SocialBox>{/* ícono Gmail */}</SocialBox>
            <SocialBox>{/* ícono Facebook */}</SocialBox>
          </RowCenter>
        </BottomSheetView>
      </BottomSheet>
    </Contenedor>
  );
}

/* ===== Estilos ===== */

const Contenedor = styled.KeyboardAvoidingView({
  flex: 1,
  paddingHorizontal: 30,
  paddingVertical: 40,
  backgroundColor: '#ffffff',
  justifyContent: 'center',
});

const Header = styled.View({
  alignItems: 'center',
  marginBottom: 25,
});

const Imagen = styled.Image({
  height: 130,
  width: 130,
});

const Titulo = styled.Text({
  fontSize: 35,
  color: '#0693E9',
  fontFamily: 'Oswald-Regular',
});

const SubTitulo = styled.Text({
  fontSize: 16,
  fontWeight: 'bold',
  color: '#0693E9',
  marginBottom: 6,
});

const Textinput = styled.TextInput({
  borderWidth: 1,
  borderColor: '#000000',
  padding: 10,
  borderRadius: 50,
  marginBottom: 15,
  color: '#1b1b1b',
  fontSize: 14,
  textAlign: 'center',
});

const Boton = styled.TouchableOpacity({
  backgroundColor: '#0693E9',
  paddingVertical: 12,
  borderRadius: 50,
  marginVertical: 10,
});

const TextoBoton = styled.Text({
  fontSize: 18,
  color: '#ffffff',
  fontWeight: 'bold',
  textAlign: 'center',
});

const Texto = styled.Text({
  fontSize: 14,
  color: '#0693E9',
});

const TextoLinkSm = styled.Text({
  fontSize: 14,
  color: '#0693E9',
  textDecorationLine: 'underline',
});

const TextLink = styled.Text({
  fontSize: 16,
  fontWeight: 'bold',
  color: '#0693E9',
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 10,
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 8,
});

const Left = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const CheckBox = styled.View({
  width: 20,
  height: 20,
  borderWidth: 1,
  borderColor: '#000000',
  backgroundColor: 'transparent',
  borderRadius: 4,
});

/* --- Estilos del Sheet de Registro --- */
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

const DividerWrap = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 16,
});

const Divider = styled.View({
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.5)',
  flex: 1,
});

const DividerText = styled.Text({
  color: '#fff',
  marginHorizontal: 10,
  fontWeight: '700',
});

const RowCenter = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 16,
});

const SocialBox = styled.View({
  width: 52,
  height: 52,
  borderRadius: 12,
  backgroundColor: '#ffffff',
  alignItems: 'center',
  justifyContent: 'center',
});

// Errores
const ErrorMsg = styled.Text({
  color: '#E53935',
  marginTop: -6,
  marginBottom: 8,
  fontSize: 12,
});

const ErrorMsgLight = styled.Text({
  color: '#FFE6E6',
  marginTop: 2,
  marginBottom: 8,
  fontSize: 12,
});

// Barra de fortaleza
const StrengthWrap = styled.View({
  marginTop: 8,
  marginBottom: 10,
});
const StrengthBarBG = styled.View({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.25)',
  overflow: 'hidden',
});
const StrengthBarFill = styled.View({
  height: '100%',
  width: '0%',
});
const StrengthLabel = styled.Text({
  color: '#E6F4FF',
  fontSize: 12,
  marginTop: 6,
  fontWeight: '600',
});
