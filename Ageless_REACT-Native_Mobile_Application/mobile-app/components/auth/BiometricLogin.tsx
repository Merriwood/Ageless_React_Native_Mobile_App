import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useBiometric } from "../../hooks/useBiometric";

/* ================================================================== *
 * BiometricLogin  —  React Native (Expo) + PWA WebAuthn
 * ------------------------------------------------------------------
 * Wrap YOUR OWN bracket pad as children. On tap it runs Face ID /
 * Touch ID; on success the check traces itself in over your pad
 * (Apple-Pay style).
 *
 *   <BiometricLogin onSuccess={...}>
 *     <BiometricIcon />
 *   </BiometricLogin>
 *
 * Web/PWA:  uses WebAuthn passkeys via navigator.credentials
 * Native:   uses expo-local-authentication via the useBiometric hook
 *
 * onSuccess receives { token, user } — ready for session storage.
 * ================================================================== */

const AnimatedPath = Animated.createAnimatedComponent(Path);
// ~ length of the check path. Measured via getTotalLength() in
// taller-mark-preview.html. Re-measure if d or viewBox change.
const CHECK_LEN = 52;
const SUCCESS_COLOR = "#34d399";

const S = {
  CHECKING: "checking",
  UNAVAILABLE: "unavailable",
  IDLE: "idle",
  PROMPTING: "prompting",
  SUCCESS: "success",
  ERROR: "error",
} as const;

type State = (typeof S)[keyof typeof S];

interface BiometricLoginProps {
  onSuccess?: (payload: { token: string; user: any }) => void;
  onError?: (error: any) => void;
  showStatus?: boolean;
  checkColor?: string;
  children: React.ReactNode;
}

export default function BiometricLogin({
  onSuccess = () => {},
  onError = () => {},
  showStatus = true,
  checkColor = SUCCESS_COLOR,
  children,
}: BiometricLoginProps) {
  const [state, setState] = useState<State>(S.CHECKING);
  const [message, setMessage] = useState("");
  const {
    isAvailable,
    biometricType,
    biometricLogin,
    hasRegisteredCredential,
  } = useBiometric();

  // subtle pulse on your pad while the sensor waits
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state !== S.PROMPTING) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1.0,
          duration: 550,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  // checkmark trace on success (strokeDashoffset -> non-native driver)
  const check = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (state === S.SUCCESS) {
      check.setValue(0);
      Animated.timing(check, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      check.setValue(0);
    }
  }, [state, check]);

  // Set initial state based on biometric availability
  useEffect(() => {
    setState(isAvailable ? S.IDLE : S.UNAVAILABLE);
    if (!isAvailable) setMessage("No biometrics enrolled.");
    else setMessage("");
  }, [isAvailable]);

  const fail = useCallback(
    (e: any) => {
      setState(S.ERROR);
      setMessage(e?.message || "Cancelled or failed. Try again.");
      onError(e);
    },
    [onError]
  );

  const succeed = useCallback(
    (payload: { token: string; user: any }) => {
      setState(S.SUCCESS);
      setMessage("Signed in");
      onSuccess(payload);
    },
    [onSuccess]
  );

  const handleTap = useCallback(async () => {
    if (state === S.CHECKING || state === S.UNAVAILABLE || state === S.PROMPTING) return;

    // If no credential registered yet, nudge toward password login
    if (!hasRegisteredCredential) {
      setState(S.ERROR);
      setMessage("Sign in with password first to enable.");
      return;
    }

    setState(S.PROMPTING);
    setMessage("Waiting for sensor\u2026");

    try {
      const result = await biometricLogin();
      if (!result) {
        throw new Error("Not verified");
      }
      succeed(result);
    } catch (e) {
      fail(e);
    }
  }, [state, hasRegisteredCredential, biometricLogin, fail, succeed]);

  const disabled = state === S.CHECKING || state === S.UNAVAILABLE || state === S.PROMPTING;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={handleTap}
        accessibilityRole="button"
        accessibilityLabel="Sign in with biometrics"
      >
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          {children}
          {state === S.SUCCESS && (
            <View style={styles.overlay} pointerEvents="none">
              <Mark anim={check} color={checkColor} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {showStatus && !!message && (
        <Text
          style={[
            styles.msg,
            state === S.ERROR && { color: "#fb7185" },
            state === S.SUCCESS && { color: checkColor },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

/* Self-tracing check — heavier stroke (the "glif"). */
function Mark({ anim, color }: { anim: Animated.Value; color: string }) {
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CHECK_LEN, 0],
  });
  return (
    <Svg width={92} height={92} viewBox="0 0 52 52">
      <AnimatedPath
        d="M12 28 L21 39 L40 8"
        stroke={color}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={CHECK_LEN}
        strokeDashoffset={strokeDashoffset}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  msg: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    minHeight: 18,
  },
});
