import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import ErrorDialog from '@/components/uiError/errorDesing'; // Modal unificado
import RegisterSheet, { RegisterSheetRef } from '../(auth)/Register';
import { login } from '../services/auth';
import { parseApiError } from '../services/error'; // <-- usamos contexto 'auth'

type LoginForm = { email: string; password: string };

const loginSchema = yup.object({
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().min(4, 'Mínimo 4 caracteres').required('La contraseña es obligatoria'),
});

export default function LoginScreen() {
  const regRef = useRef<RegisterSheetRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({ resolver: yupResolver(loginSchema), mode: 'onChange' });

  const [loadingLogin, setLoadingLogin] = useState(false);

  // Estado del modal de error
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | undefined>();

  const onLogin = async ({ email, password }: LoginForm) => {
    try {
      setLoadingLogin(true);
      await login({ email, password });
      router.replace('../(app)/home');
    } catch (e: any) {
      // <<< CAMBIO: fuerza mensaje claro sólo en auth y define fallback >>>
      const { msg, details } = parseApiError(e, {
        context: 'auth',
        fallback: 'No fue posible iniciar sesión.',
      });
      setErrorMsg(msg);
      setErrorDetails(details);
      setErrorOpen(true);
    } finally {
      setLoadingLogin(false);
    }
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
        control={control}
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
            style={{ borderColor: errors.email ? '#E53935' : '#000000' }}
          />
        )}
      />
      {errors.email && <ErrorMsg>{errors.email.message}</ErrorMsg>}

      <SubTitulo>Contraseña</SubTitulo>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Textinput
            placeholder="Ingrese contraseña"
            secureTextEntry
            placeholderTextColor="#A5A5A5"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={{ borderColor: errors.password ? '#E53935' : '#000000' }}
          />
        )}
      />
      {errors.password && <ErrorMsg>{errors.password.message}</ErrorMsg>}

      <Boton
        onPress={handleSubmit(onLogin)}
        disabled={!isValid || loadingLogin}
        style={{ opacity: isValid && !loadingLogin ? 1 : 0.6 }}
      >
        <TextoBoton>{loadingLogin ? 'Ingresando…' : 'Ingresar'}</TextoBoton>
      </Boton>

      <Row>
        <TextoLinkSm>Contraseña Olvidada</TextoLinkSm>
      </Row>

      <TextLink>¿No tienes Cuenta?</TextLink>
      <Boton onPress={() => regRef.current?.open()}>
        <TextoBoton>Registrarse</TextoBoton>
      </Boton>

      {/* Sheet de Registro */}
      <RegisterSheet ref={regRef} />

      {/* Modal de error unificado */}
      <ErrorDialog
        visible={errorOpen}
        title="No se pudo iniciar sesión"
        message={errorMsg}
        details={errorDetails}
        onClose={() => setErrorOpen(false)}
        primaryLabel="Entendido"
      />
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

const Header = styled.View({ alignItems: 'center', marginBottom: 25 });
const Imagen = styled.Image({ height: 130, width: 130 });
const Titulo = styled.Text({ fontSize: 35, color: '#0693E9', fontFamily: 'Oswald-Regular' });

const SubTitulo = styled.Text({ fontSize: 16, fontWeight: 'bold', color: '#0693E9', marginBottom: 6 });

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

const TextoLinkSm = styled.Text({ fontSize: 14, color: '#0693E9', textDecorationLine: 'underline' });
const TextLink = styled.Text({ fontSize: 16, fontWeight: 'bold', color: '#0693E9', textAlign: 'center', marginTop: 20, marginBottom: 10 });

const Row = styled.View({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 });

const ErrorMsg = styled.Text({ color: '#E53935', marginTop: -6, marginBottom: 8, fontSize: 12 });
