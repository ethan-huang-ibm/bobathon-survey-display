'use client';

import { useState, useEffect } from 'react';
import { GridLayout } from './GridLayout';
import { DataTable } from './DataTable';
import { ChartWidget } from './ChartWidget';
import { StatsCard } from './StatsCard';

interface SurveyData {
  [key: string]: string;
}

export default function Dashboard() {
  const [data, setData] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    // Try to load default CSV if available
    loadDefaultCSV();
  }, []);

  const loadDefaultCSV = async () => {
    try {
      const response = await fetch('/survey-data.csv');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        setData(parsed);
        setFileName('survey-data.csv');
      }
    } catch (error) {
      console.log('No default CSV found, waiting for file upload');
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setLoading(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setData(parsed);
      setLoading(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const parseCSV = (text: string): SurveyData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: SurveyData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      // Check if the row is not empty and the first column is not empty
      const check = lines[i].split(",")
      if (values.length === headers.length && check[0]) {
        const row: SurveyData = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  // Column 1: Role Distribution
  const roleDistribution = data.reduce((acc, row) => {
    const role = row['1'] || 'Unknown';
    const other = row['1_4_TEXT'] || "Unknown"
    if (role !== "Unknown" && role !== "Other") acc[role] = (acc[role] || 0) + 1;
    if (other !== "Unknown") acc[other] = (acc[other] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Column 3: Experience Levels
  const experienceLevels = data.reduce((acc, row) => {
    const level = row['3'] || 'Unknown';
    if (level!== "Unknown") acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Column 6: Coding Languages
  const codingDistribution = data.reduce((acc, row) => {
    const os = row['6'] || '';
    const other = row['6_8_TEXT'] || ""

    os.split(",").forEach((l) => {
      if (l!=="" && l!=="Other") acc[l] = (acc[l] || 0) + 1;
    })

    other.split(",").forEach((l) => {
      if (l!=="") acc[l] = (acc[l] || 0) + 1;
    })

    return acc;
  }, {} as Record<string, number>);

  // Column 7: Team Size
  const teamSizeDistribution = data.reduce((acc, row) => {
    const size = row['7'] || 'Unknown';
    const other = row['7_10_TEXT'] || 'Unknown'
    size.split("/").forEach((s) => {
      if (s !== "Other" && s !== "Unknown") acc[s] = (acc[s] || 0) + 1;
    })
    other.split("/").forEach((s) => {
      if (other !== "Unknown") acc[s] = (acc[s] || 0) + 1;
    })
    return acc;
  }, {} as Record<string, number>);

  // Column 8: AI (multi-select)
  const aiCount: Record<string, number> = {};
  data.forEach(row => {
    const languages = row['8'] || '';
    languages.split(',').forEach(lang => {
      const trimmed = lang.trim();
      if (trimmed) {
        if (trimmed!== "Unknown") aiCount[trimmed] = (aiCount[trimmed] || 0) + 1;
      }
    });
  });

  // Column 9: Pain Points (multi-select)
  const opps: Record<string, number> = {};
  data.forEach(row => {
    const points = row['9'] || '';
    const other = row['10'] ||'';

    points.split(',').forEach(point => {
      const trimmed = point.trim();
      if (trimmed) {
         if (trimmed!== "" && trimmed!== "Other") opps[trimmed] = (opps[trimmed] || 0) + 1;
      }
    });

    other.split(',').forEach(point => {
      const trimmed = point.trim();
      if (trimmed && trimmed!=="") {
        if (trimmed!== "") opps[trimmed] = (opps[trimmed] || 0) + 1;
      }
    });
  });

  // Column 14: Desired Features (multi-select)
  const desiredFeatures: Record<string, number> = {};
  data.forEach(row => {
    const features = row['14'] || '';
    features.split(',').forEach(feature => {
      const trimmed = feature.trim();
      if (trimmed) {
        desiredFeatures[trimmed] = (desiredFeatures[trimmed] || 0) + 1;
      }
    });
  });

  // Column 16: Learning Topics
  const learningTopics: Record<string, number> = {};
  data.forEach(row => {
    const topic = row['16'] || '';
    if (topic.trim()) {
      learningTopics[topic] = (learningTopics[topic] || 0) + 1;
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            {fileName.split('.csv')[0]} Bobathon Survey Results
          </h1>
          {fileName && (
            <p className="text-foreground/60 text-sm mt-2">
              📄 {fileName} ({data.length} responses)
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-800 text-white font-semibold transition-colors">
              Upload CSV
            </span>
          </label>
        </div>
      </div>
      <br/>
      <GridLayout
      title=""
      >

        {/* Summary Stats Cards */}
        <StatsCard
          title="Total Responses"
          value={data.length}
          icon="users"
          color="blue"
        />
      </GridLayout>
      <br/>
      <br/>
      <GridLayout
      title='Development Insights'
      >

        {/* Column 1: Role Distribution */}
        <ChartWidget
          title="Role Distribution"
          data={Object.entries(roleDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({
            name,
            value
          }))}
          type="pie"
        />

        {/* Column 3: Dev Experience */}
        <ChartWidget
          title="Generative AI Experience"
          data={Object.entries(experienceLevels)
          .sort((a, b) => b[1] - a[1])  
          .map(([name, value]) => ({
            name,
            value
          }))}
          type="pie"
        />

        {/* Column 6: AI Count */}
        <ChartWidget
          title="Coding Languages"
          data={Object.entries(codingDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({
            name,
            value
          }))}
          type="pie"
        />
        </GridLayout>
        <br/>
        <br/>
        <GridLayout
          title="Bob Opportunities"
        >
        {/* Column 7: Team Size */}
        <ChartWidget
          title="Current Bottlenecks"
          data={Object.entries(teamSizeDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({
            name,
            value
          }))}
          type="bar"
        />
        {/* Column 11: Desired Features */}
        <ChartWidget
          title="Bob Use Cases"
          data={Object.entries(opps)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({
              name: name.length > 35 ? name.substring(0, 35) + '...' : name,
              value
            }))}
          type="bar"
        />
      </GridLayout>
    </div>
  );
}

// Made with Bob
