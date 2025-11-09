import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect } from "react";
import { Button, Modal, ScrollView, Text, View } from "react-native";
import { useAsyncStorageDump } from "./useAsyncStorageDump";

type Props = { visible: boolean; onClose: () => void };

export default function DebugStorageModal({ visible, onClose }: Props) {
  const { data, loading, refresh, clearAll } = useAsyncStorageDump();

  useEffect(() => { if (visible) refresh(); }, [visible]);

  const exportJson = async () => {
    const uri = FileSystem.cacheDirectory + "asyncstorage_dump.json";
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>AsyncStorage (Expo)</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title={loading ? "Cargando..." : "Recargar"} onPress={refresh} />
          <Button title="Exportar JSON" onPress={exportJson} />
          <Button title="Borrar todo" onPress={clearAll} />
          <Button title="Cerrar" onPress={onClose} />
        </View>
        <ScrollView style={{ marginTop: 12 }}>
          {Object.keys(data).length === 0 && (
            <Text style={{ opacity: 0.6 }}>Sin claves guardadas.</Text>
          )}
          {Object.entries(data).map(([k, v]) => (
            <View key={k} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: "bold" }}>{k}</Text>
              <Text selectable numberOfLines={6}>
                {typeof v === "string" ? v : JSON.stringify(v)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}