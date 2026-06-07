import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const CORES = {
  fundo:      "#F7F1E3",
  ouro:       "#C8A62D",
  ouroClaro:  "#E4C441",
  tinta:      "#1F1B16",
  tintaSuave: "#9C8E7E",
  borda:      "#D8CFBE",
  pill:       "#E4C44130",
  pillBorda:  "#C8A62D60",
};

function TabIcon({ icon, label, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <FontAwesome5
        name={icon}
        size={20}
        color={focused ? CORES.ouro : CORES.tintaSuave}
        solid={focused}
      />
      <Text style={[styles.label, focused && styles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function AbasLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="exchange-alt"  focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Info"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="chart-line"  focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Perfil"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="user-circle" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: CORES.fundo,
    borderTopWidth: 1.5,
    borderTopColor: CORES.borda,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 12,
    shadowColor: "#1F1B16",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 5,
    minWidth: 80,
  },

  iconWrapActive: {
    backgroundColor: CORES.pill,
    borderWidth: 1.5,
    borderColor: CORES.pillBorda,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: CORES.tintaSuave,
  },

  labelActive: {
    color: CORES.ouro,
    fontWeight: "700",
  },
});