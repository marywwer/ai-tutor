import React, { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import AiTutorModule, {
  acceptToken,
  getInfo,
} from "../index";
import { useChatStore } from "../src/entities/chat/store";

const App = () => {
  const createChat = useChatStore((s) => s.createChat);

  useEffect(() => {
    acceptToken("DEV_FAKE_TOKEN");

    getInfo({
      widgetId: 1,
      userId: 42,
      role: "student",
      config: {},
      board: {
        id: 10,
        name: "Math board",
        parentId: 0,
      },
    });

    createChat();
  }, []);

  return (
    <ReactFlowProvider>
      <div>
        <AiTutorModule />
      </div>
    </ReactFlowProvider>
  );
};

export default App;
