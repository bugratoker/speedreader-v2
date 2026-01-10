import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, X, CheckCircle, AlertCircle, Type, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { ImportProgress } from '../../types/libraryTypes';
import { importDocument, importTextContent } from '../../services/pdfService';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ImportMode = 'menu' | 'paste' | 'progress';

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onClose,
  onImportComplete,
}) => {
  const { colors, fontFamily, fontSize, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ImportMode>('menu');
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');

  const resetState = () => {
    setMode('menu');
    setProgress(null);
    setPasteTitle('');
    setPasteContent('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleImportFile = async () => {
    setMode('progress');
    const result = await importDocument(setProgress);
    
    if (result) {
      onImportComplete();
      setTimeout(handleClose, 1200);
    } else if (progress?.stage !== 'error') {
      // User cancelled
      resetState();
    }
  };

  const handlePasteText = async () => {
    if (!pasteTitle.trim() || !pasteContent.trim()) return;
    
    setMode('progress');
    const result = await importTextContent(pasteContent.trim(), pasteTitle.trim(), setProgress);
    
    if (result) {
      onImportComplete();
      setTimeout(handleClose, 1200);
    }
  };

  const renderMenu = () => (
    <Animated.View entering={FadeIn.duration(200)} style={styles.menuContainer}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
        Import Content
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
        Add books or articles to your library
      </Text>

      {/* File Import Option */}
      <TouchableOpacity
        style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
        onPress={handleImportFile}
        activeOpacity={0.7}
      >
        <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
          <FileText size={24} color={colors.primary} strokeWidth={1.5} />
        </View>
        <View style={styles.optionText}>
          <Text style={{ color: colors.text, fontFamily: fontFamily.uiBold, fontSize: fontSize.md }}>
            Import File
          </Text>
          <Text style={{ color: colors.textMuted, fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm }}>
            PDF or TXT from your device
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Paste Text Option */}
      <TouchableOpacity
        style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
        onPress={() => setMode('paste')}
        activeOpacity={0.7}
      >
        <View style={[styles.optionIcon, { backgroundColor: colors.secondary + '15' }]}>
          <Type size={24} color={colors.secondary} strokeWidth={1.5} />
        </View>
        <View style={styles.optionText}>
          <Text style={{ color: colors.text, fontFamily: fontFamily.uiBold, fontSize: fontSize.md }}>
            Paste Text
          </Text>
          <Text style={{ color: colors.textMuted, fontFamily: fontFamily.uiRegular, fontSize: fontSize.sm }}>
            Copy and paste any text content
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPasteMode = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Animated.View entering={FadeInDown.duration(200)} style={styles.pasteContainer}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
          Paste Text
        </Text>

        {/* Title Input */}
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.uiMedium }]}>
          Title
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
              color: colors.text,
              fontFamily: fontFamily.uiRegular,
            },
          ]}
          placeholder="Enter a title..."
          placeholderTextColor={colors.textMuted}
          value={pasteTitle}
          onChangeText={setPasteTitle}
        />

        {/* Content Input */}
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: fontFamily.uiMedium }]}>
          Content
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.glassBorder,
              color: colors.text,
              fontFamily: fontFamily.uiRegular,
            },
          ]}
          placeholder="Paste your text here..."
          placeholderTextColor={colors.textMuted}
          value={pasteContent}
          onChangeText={setPasteContent}
          multiline
          textAlignVertical="top"
        />

        {/* Word count */}
        <Text style={[styles.wordCount, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
          {pasteContent.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()} words
        </Text>

        {/* Actions */}
        <View style={styles.pasteActions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.glassBorder }]}
            onPress={() => setMode('menu')}
          >
            <Text style={{ color: colors.textMuted, fontFamily: fontFamily.uiMedium }}>
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.importButton,
              {
                backgroundColor: pasteTitle.trim() && pasteContent.trim() ? colors.primary : colors.surface,
                opacity: pasteTitle.trim() && pasteContent.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handlePasteText}
            disabled={!pasteTitle.trim() || !pasteContent.trim()}
          >
            <Text
              style={{
                color: pasteTitle.trim() && pasteContent.trim() ? 'white' : colors.textMuted,
                fontFamily: fontFamily.uiBold,
              }}
            >
              Import
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );

  const renderProgress = () => (
    <Animated.View entering={FadeIn.duration(200)} style={styles.progressContainer}>
      {progress?.stage === 'error' ? (
        <>
          <View style={[styles.stateIcon, { backgroundColor: '#ef444420' }]}>
            <AlertCircle size={40} color="#ef4444" strokeWidth={1.5} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
            Import Failed
          </Text>
          <Text style={[styles.stateMessage, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
            {progress.error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
            onPress={resetState}
          >
            <Text style={{ color: colors.text, fontFamily: fontFamily.uiMedium }}>Try Again</Text>
          </TouchableOpacity>
        </>
      ) : progress?.stage === 'done' ? (
        <>
          <View style={[styles.stateIcon, { backgroundColor: '#22c55e20' }]}>
            <CheckCircle size={40} color="#22c55e" strokeWidth={1.5} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text, fontFamily: fontFamily.uiBold }]}>
            Import Complete!
          </Text>
          <Text style={[styles.stateMessage, { color: colors.textMuted, fontFamily: fontFamily.uiRegular }]}>
            Your content is ready to read
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateTitle, { color: colors.text, fontFamily: fontFamily.uiBold, marginTop: 20 }]}>
            {progress?.message || 'Processing...'}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.glassBorder }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress?.progress || 0}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </>
      )}
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Content */}
          <ScrollView 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {mode === 'menu' && renderMenu()}
            {mode === 'paste' && renderPasteMode()}
            {mode === 'progress' && renderProgress()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    minHeight: 350,
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  menuContainer: {
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 14,
  },
  pasteContainer: {
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textArea: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  wordCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  pasteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  stateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  progressBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
