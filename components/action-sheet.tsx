import React from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { X } from 'lucide-react-native';

interface ActionSheetOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

interface ActionSheetProps {
  title: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export function ActionSheet({ title, options, onClose }: ActionSheetProps) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.backdrop} 
        onPress={onClose}
      >
        <View style={styles.contentWrapper}>
          <Pressable style={styles.content}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} className="text-gray-500" />
              </Pressable>
            </View>
            
            {options.map((option) => (
              <Pressable
                key={option.id}
                className="flex-row items-center p-4 active:bg-gray-100 rounded-xl mb-1"
                onPress={option.onPress}
              >
                {option.icon && (
                  <View className="mr-3">
                    {option.icon}
                  </View>
                )}
                <Text className="text-base font-medium text-gray-900">{option.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  contentWrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 