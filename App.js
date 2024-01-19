import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, AntDesign, Feather } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working"; // 새로운 상수 추가

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    loadWorkingState();
    loadToDos();
  }, []);

  const travel = () => {
    setWorking(false);
    saveWorkingState(false);
  };

  const work = () => {
    setWorking(true);
    saveWorkingState(true);
  };

  const saveWorkingState = async (workingState) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(workingState));
    } catch (error) {
      console.error("Error saving working state:", error);
    }
  };

  const loadWorkingState = async () => {
    try {
      const s = await AsyncStorage.getItem(WORKING_KEY);
      if (s !== null) {
        setWorking(JSON.parse(s));
      }
    } catch (error) {
      console.error("Error loading working state:", error);
    }
  };

  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
    } catch (error) {
      console.error("Error loading todos:", error);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    if (Platform.OS == "web") {
      const ok = confirm("Do you want to delete this to Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm sure",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const editToDo = async (key) => {
    setEditMode(key);
    setEditedText(toDos[key].text);
  };

  const saveEditedToDo = async () => {
    if (editedText === "") {
      return;
    }

    const updatedToDos = {
      ...toDos,
      [editMode]: { text: editedText, working: toDos[editMode].working },
    };

    setToDos(updatedToDos);
    setEditMode(null);
    setEditedText("");
    saveToDos(updatedToDos);
  };

  const toggleCompleteToDo = async (key) => {
    const newToDos = {
      ...toDos,
      [key]: {
        ...toDos[key],
        completed: !toDos[key].completed,
      },
    };
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : "gray" }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: !working ? "white" : "gray",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {editMode === key ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editedText}
                    onChangeText={(text) => setEditedText(text)}
                  />
                  <TouchableOpacity onPress={saveEditedToDo}>
                    <AntDesign name="check" size={18} color="green" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "600",
                      textDecorationLine: toDos[key].completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() => deleteToDo(key)}
                      style={styles.icon}
                    >
                      <Fontisto name="trash" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => editToDo(key)}
                      style={styles.icon}
                    >
                      <AntDesign name="edit" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleCompleteToDo(key)}
                      style={styles.icon}
                    >
                      <Feather
                        name="check-circle"
                        size={20}
                        color={toDos[key].completed ? "white" : "black"}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // 아이콘 사이에 공간을 균등하게 배분
    width: 90, // 아이콘 컨테이너의 너비를 조절하여 아이콘 사이의 간격 조정
  },
  icon: {
    marginRight: 5, // 필요에 따라 조정
  },
});
