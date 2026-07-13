import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, ActivityIndicator, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import RNFS from 'react-native-fs';
import WebView from 'react-native-webview';

const CAD_VIEWER_DIR = `${RNFS.DocumentDirectoryPath}/cad-viewer`;
const UPLOADS_DIR = `${CAD_VIEWER_DIR}/uploads`;
const ASSETS_CAD_VIEWER_DIR = './assets/cad-viewer';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
}

const CadViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    initializeCadViewer();
  }, []);

  const initializeCadViewer = async () => {
    try {
      const exists = await RNFS.exists(CAD_VIEWER_DIR);
      if (!exists) {
        await RNFS.mkdir(CAD_VIEWER_DIR);
      }

      const uploadsExists = await RNFS.exists(UPLOADS_DIR);
      if (!uploadsExists) {
        await RNFS.mkdir(UPLOADS_DIR);
      }

      await copyAssetsToSandbox();
      await loadUploadedFiles();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize CAD viewer:', error);
      Alert.alert('错误', 'CAD 查看器初始化失败');
      setIsLoading(false);
    }
  };

  const copyAssetsToSandbox = async () => {
    try {
      const assetFiles = await RNFS.readDirAssets(ASSETS_CAD_VIEWER_DIR);
      for (const file of assetFiles) {
        const destPath = `${CAD_VIEWER_DIR}/${file.name}`;
        const destExists = await RNFS.exists(destPath);
        
        if (!destExists) {
          await RNFS.copyFileAssets(`${ASSETS_CAD_VIEWER_DIR}/${file.name}`, destPath);
        }
      }
    } catch (error) {
      console.error('Failed to copy assets:', error);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const files = await RNFS.readDir(UPLOADS_DIR);
      const dxfFiles = files.filter(f => f.name.toLowerCase().endsWith('.dxf'));
      const result: UploadedFile[] = await Promise.all(
        dxfFiles.map(async (file) => {
          const stat = await RNFS.stat(file.path);
          return {
            name: file.name,
            path: file.path,
            size: stat.size,
          };
        })
      );
      setUploadedFiles(result);
    } catch (error) {
      console.error('Failed to load uploaded files:', error);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/octet-stream',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name || 'untitled.dxf';

      if (!fileName.toLowerCase().endsWith('.dxf')) {
        Alert.alert('格式错误', '仅支持 DXF 格式文件');
        return;
      }

      const destPath = `${UPLOADS_DIR}/${fileName}`;
      await RNFS.copyFile(asset.uri, destPath);

      setSelectedFilePath(destPath);
      setViewerReady(false);
      await loadUploadedFiles();
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('错误', '选择文件失败');
    }
  };

  const handleFileSelect = async (filePath: string) => {
    setSelectedFilePath(filePath);
    setViewerReady(false);
  };

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    const data = event.nativeEvent.data;
    if (data === 'viewer_ready') {
      setViewerReady(true);
      if (selectedFilePath) {
        openDxfFile(selectedFilePath);
      }
    }
  };

  const openDxfFile = (filePath: string) => {
    if (webViewRef.current) {
      const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const jsCode = `window.openDxfFile('${escapedPath}');`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const viewerUrl = `file://${CAD_VIEWER_DIR}/viewer.html`;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>正在初始化 CAD 查看器...</Text>
        </View>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Button title="选择 DXF 文件" onPress={handleDocumentPicker} />
          </View>
          
          {uploadedFiles.length > 0 && (
            <View style={styles.fileListContainer}>
              <Text style={styles.fileListTitle}>已上传文件</Text>
              <FlatList
                data={uploadedFiles}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.fileItem}
                    onPress={() => handleFileSelect(item.path)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.fileName}>{item.name}</Text>
                    <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={uploadedFiles.length > 3}
              />
            </View>
          )}
          
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: viewerUrl }}
              style={styles.webView}
              allowFileAccess={true}
              originWhitelist={['*']}
              allowUniversalAccessFromFileURLs={true}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccessFromFileURLs={true}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fileListContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 150,
  },
  fileListTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileName: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    marginRight: 12,
  },
  fileSize: {
    fontSize: 12,
    color: '#999999',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});

export default CadViewer;
