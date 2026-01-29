import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { Colors } from "@/constants/Colors";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  minHeight = 300,
}: RichTextEditorProps) {
  const richText = useRef<RichEditor>(null);

  const handleChange = useCallback(
    (html: string) => {
      onChange(html);
    },
    [onChange]
  );

  // 커스텀 CSS for editor content
  const editorCSS = `
    * {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${Colors.text};
    }
    body {
      background-color: transparent;
      padding: 12px;
      margin: 0;
      min-height: ${minHeight - 50}px;
    }
    p {
      margin: 0 0 12px 0;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: ${Colors.text};
      margin: 16px 0 8px 0;
    }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 18px; }
    ul, ol {
      margin: 8px 0;
      padding-left: 24px;
    }
    li {
      margin: 4px 0;
      line-height: 1.5;
    }
    input[type="checkbox"] {
      margin-right: 8px;
      width: 18px;
      height: 18px;
      accent-color: ${Colors.primary};
    }
    blockquote {
      border-left: 3px solid ${Colors.primary};
      margin: 12px 0;
      padding-left: 16px;
      color: ${Colors.textMuted};
      font-style: italic;
    }
    a {
      color: ${Colors.primary};
    }
    ::placeholder {
      color: ${Colors.textMuted};
    }
  `;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Rich Editor */}
      <View style={[styles.editorContainer, { minHeight }]}>
        <RichEditor
          ref={richText}
          initialContentHTML={value}
          onChange={handleChange}
          placeholder={placeholder}
          editorStyle={{
            backgroundColor: Colors.cardSolid,
            color: Colors.text,
            placeholderColor: Colors.textMuted,
            contentCSSText: editorCSS,
            caretColor: Colors.primary,
          }}
          style={styles.editor}
          initialHeight={minHeight}
          useContainer={true}
          pasteAsPlainText={false}
        />
      </View>

      {/* Toolbar */}
      <RichToolbar
        editor={richText}
        selectedIconTint={Colors.accent}
        iconTint={Colors.textMuted}
        style={styles.toolbar}
        flatContainerStyle={styles.toolbarContainer}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.heading1,
          actions.heading2,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.checkboxList,
          actions.setStrikethrough,
          actions.blockquote,
          actions.undo,
          actions.redo,
        ]}
        iconMap={{
          [actions.heading1]: ({ tintColor }: { tintColor: string }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.headingIcon, { borderColor: tintColor }]}>
                <View style={[styles.headingText, { backgroundColor: tintColor }]} />
              </View>
            </View>
          ),
          [actions.heading2]: ({ tintColor }: { tintColor: string }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.headingIcon2, { borderColor: tintColor }]}>
                <View style={[styles.headingText2, { backgroundColor: tintColor }]} />
              </View>
            </View>
          ),
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardSolid,
  },
  editor: {
    flex: 1,
    backgroundColor: Colors.cardSolid,
  },
  toolbar: {
    backgroundColor: Colors.cardSolid,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderRadius: 12,
    marginTop: 8,
    height: 44,
  },
  toolbarContainer: {
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headingIcon: {
    width: 20,
    height: 16,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    width: 12,
    height: 3,
    borderRadius: 1,
  },
  headingIcon2: {
    width: 18,
    height: 14,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText2: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
});
